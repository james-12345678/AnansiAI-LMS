// Enhanced Authentication Service with School-Level Security
// Provides secure authentication with complete school data isolation

import { schoolDataIsolation } from "./schoolDataIsolation";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT";
  schoolId: string;
  schoolName: string;
  permissions: string[];
  mfaEnabled: boolean;
  lastLogin: string;
  sessionExpiry: number;
  mustChangePassword: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
  schoolCode?: string;
  mfaToken?: string;
  rememberMe?: boolean;
}

interface SecuritySession {
  sessionId: string;
  userId: string;
  schoolId: string;
  role: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastActivity: string;
  expiresAt: string;
  isSecure: boolean;
  deviceFingerprint: string;
}

interface SecurityEvent {
  type:
    | "login_success"
    | "login_failed"
    | "logout"
    | "session_expired"
    | "suspicious_activity"
    | "mfa_required"
    | "password_changed";
  userId?: string;
  schoolId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details: string;
  severity: "low" | "medium" | "high" | "critical";
}

class SecureAuthService {
  private currentUser: AuthUser | null = null;
  private currentSession: SecuritySession | null = null;
  private securityEvents: SecurityEvent[] = [];
  private failedAttempts: Map<string, { count: number; lastAttempt: number }> =
    new Map();
  private maxFailedAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutes

  /**
   * Authenticate user with school-specific validation
   */
  public async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { email, password, schoolCode, mfaToken } = credentials;
    const ipAddress = this.getClientIP();
    const userAgent = this.getClientUserAgent();

    try {
      // Check for account lockout
      if (this.isAccountLocked(email)) {
        this.logSecurityEvent(
          "login_failed",
          undefined,
          undefined,
          ipAddress,
          userAgent,
          "Account locked due to multiple failed attempts",
          "high",
        );
        throw new Error(
          "Account is temporarily locked due to multiple failed login attempts",
        );
      }

      // Validate credentials
      const user = await this.validateCredentials(email, password, schoolCode);
      if (!user) {
        this.recordFailedAttempt(email);
        this.logSecurityEvent(
          "login_failed",
          undefined,
          undefined,
          ipAddress,
          userAgent,
          `Invalid credentials for ${email}`,
          "medium",
        );
        throw new Error("Invalid email or password");
      }

      // Check if MFA is required
      if (user.mfaEnabled && !mfaToken) {
        this.logSecurityEvent(
          "mfa_required",
          user.id,
          user.schoolId,
          ipAddress,
          userAgent,
          "MFA token required for login",
          "low",
        );
        throw new Error("MFA_REQUIRED");
      }

      // Validate MFA token if provided
      if (
        user.mfaEnabled &&
        mfaToken &&
        !this.validateMFAToken(user.id, mfaToken)
      ) {
        this.recordFailedAttempt(email);
        this.logSecurityEvent(
          "login_failed",
          user.id,
          user.schoolId,
          ipAddress,
          userAgent,
          "Invalid MFA token",
          "medium",
        );
        throw new Error("Invalid MFA token");
      }

      // Initialize school context
      await schoolDataIsolation.initializeSchoolContext(user.schoolId);

      // Create secure session
      const session = this.createSecureSession(user, ipAddress, userAgent);

      // Update user info
      user.lastLogin = new Date().toISOString();

      // Clear failed attempts
      this.failedAttempts.delete(email);

      // Set current state
      this.currentUser = user;
      this.currentSession = session;

      // Store in secure storage
      this.storeSecureSession(session);

      this.logSecurityEvent(
        "login_success",
        user.id,
        user.schoolId,
        ipAddress,
        userAgent,
        `Successful login for ${user.email}`,
        "low",
      );

      return user;
    } catch (error) {
      if (error instanceof Error && error.message !== "MFA_REQUIRED") {
        this.recordFailedAttempt(email);
      }
      throw error;
    }
  }

  /**
   * Logout and clear all school data
   */
  public async logout(): Promise<void> {
    if (this.currentUser && this.currentSession) {
      const ipAddress = this.getClientIP();
      const userAgent = this.getClientUserAgent();

      this.logSecurityEvent(
        "logout",
        this.currentUser.id,
        this.currentUser.schoolId,
        ipAddress,
        userAgent,
        `User ${this.currentUser.email} logged out`,
        "low",
      );

      // Clear school context and encrypted data
      schoolDataIsolation.clearSchoolContext();

      // Invalidate session
      this.invalidateSession(this.currentSession.sessionId);

      // Clear secure storage
      this.clearSecureStorage();

      // Reset state
      this.currentUser = null;
      this.currentSession = null;
    }
  }

  /**
   * Verify current session is valid and secure
   */
  public verifySession(): boolean {
    if (!this.currentSession || !this.currentUser) {
      return false;
    }

    const now = Date.now();
    const expiresAt = new Date(this.currentSession.expiresAt).getTime();

    // Check if session has expired
    if (now > expiresAt) {
      this.logSecurityEvent(
        "session_expired",
        this.currentUser.id,
        this.currentUser.schoolId,
        this.getClientIP(),
        this.getClientUserAgent(),
        "Session expired",
        "low",
      );
      this.logout();
      return false;
    }

    // Update last activity
    this.currentSession.lastActivity = new Date().toISOString();

    // Verify school context matches
    const schoolContext = schoolDataIsolation.getCurrentSchoolContext();
    if (
      !schoolContext ||
      schoolContext.schoolId !== this.currentUser.schoolId
    ) {
      this.logSecurityEvent(
        "suspicious_activity",
        this.currentUser.id,
        this.currentUser.schoolId,
        this.getClientIP(),
        this.getClientUserAgent(),
        "School context mismatch detected",
        "high",
      );
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): AuthUser | null {
    if (this.verifySession()) {
      return this.currentUser;
    }
    return null;
  }

  /**
   * Check if user has specific permission
   */
  public hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return (
      user.permissions.includes(permission) ||
      user.role === "SUPER_ADMIN" ||
      (user.role === "ADMIN" && permission !== "super_admin")
    );
  }

  /**
   * Check if user can access specific school data
   */
  public canAccessSchoolData(schoolId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admins can access any school
    if (user.role === "SUPER_ADMIN") return true;

    // Others can only access their own school
    return user.schoolId === schoolId;
  }

  /**
   * Change user password with security validation
   */
  public async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Validate current password
    if (!(await this.validateUserPassword(user.id, currentPassword))) {
      this.logSecurityEvent(
        "login_failed",
        user.id,
        user.schoolId,
        this.getClientIP(),
        this.getClientUserAgent(),
        "Invalid current password during password change",
        "medium",
      );
      throw new Error("Current password is incorrect");
    }

    // Validate new password strength
    if (!this.validatePasswordStrength(newPassword)) {
      throw new Error("New password does not meet security requirements");
    }

    // Update password (in real implementation, this would hash and store)
    await this.updateUserPassword(user.id, newPassword);

    this.logSecurityEvent(
      "password_changed",
      user.id,
      user.schoolId,
      this.getClientIP(),
      this.getClientUserAgent(),
      "Password changed successfully",
      "low",
    );
  }

  /**
   * Enable MFA for current user
   */
  public async enableMFA(): Promise<{ qrCode: string; backupCodes: string[] }> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Generate MFA secret and backup codes
    const mfaSecret = this.generateMFASecret();
    const backupCodes = this.generateBackupCodes();
    const qrCode = this.generateQRCode(user.email, mfaSecret);

    // Store MFA settings (in real implementation)
    await this.storeMFASettings(user.id, mfaSecret);

    return { qrCode, backupCodes };
  }

  /**
   * Get security events for current school (admin only)
   */
  public getSchoolSecurityEvents(): SecurityEvent[] {
    const user = this.getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      throw new Error("Insufficient permissions");
    }

    return this.securityEvents.filter(
      (event) =>
        event.schoolId === user.schoolId || user.role === "SUPER_ADMIN",
    );
  }

  /**
   * Force logout all sessions for a user (admin only)
   */
  public async forceLogoutUser(targetUserId: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Insufficient permissions");
    }

    // In real implementation, this would invalidate all sessions for the target user
    this.logSecurityEvent(
      "logout",
      targetUserId,
      user.schoolId,
      this.getClientIP(),
      this.getClientUserAgent(),
      `Forced logout by admin ${user.email}`,
      "medium",
    );
  }

  // Private helper methods
  private async validateCredentials(
    email: string,
    password: string,
    schoolCode?: string,
  ): Promise<AuthUser | null> {
    // In a real implementation, this would query the database
    const mockUsers: AuthUser[] = [
      {
        id: "user_1",
        email: "admin@nairobiacademy.ac.ke",
        name: "Dr. Sarah Johnson",
        role: "ADMIN",
        schoolId: "school_001",
        schoolName: "Nairobi Academy",
        permissions: [
          "admin",
          "manage_users",
          "view_reports",
          "manage_security",
        ],
        mfaEnabled: true,
        lastLogin: "",
        sessionExpiry: 8 * 60 * 60 * 1000, // 8 hours
        mustChangePassword: false,
      },
      {
        id: "user_2",
        email: "teacher@nairobiacademy.ac.ke",
        name: "John Kimani",
        role: "TEACHER",
        schoolId: "school_001",
        schoolName: "Nairobi Academy",
        permissions: ["teach", "view_students", "create_content"],
        mfaEnabled: false,
        lastLogin: "",
        sessionExpiry: 4 * 60 * 60 * 1000, // 4 hours
        mustChangePassword: false,
      },
    ];

    return (
      mockUsers.find(
        (user) =>
          user.email === email &&
          this.validatePassword(password) &&
          (!schoolCode || user.schoolId === schoolCode),
      ) || null
    );
  }

  private validatePassword(password: string): boolean {
    // In real implementation, this would hash and compare
    return password.length >= 8;
  }

  private validateUserPassword(
    userId: string,
    password: string,
  ): Promise<boolean> {
    // In real implementation, this would verify against stored hash
    return Promise.resolve(password.length >= 8);
  }

  private validatePasswordStrength(password: string): boolean {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumbers &&
      hasSpecialChars
    );
  }

  private validateMFAToken(userId: string, token: string): boolean {
    // In real implementation, this would validate against stored secret
    return token.length === 6 && /^\d+$/.test(token);
  }

  private createSecureSession(
    user: AuthUser,
    ipAddress: string,
    userAgent: string,
  ): SecuritySession {
    const sessionId = this.generateSecureSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + user.sessionExpiry);

    return {
      sessionId,
      userId: user.id,
      schoolId: user.schoolId,
      role: user.role,
      ipAddress,
      userAgent,
      loginTime: now.toISOString(),
      lastActivity: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isSecure: true,
      deviceFingerprint: this.generateDeviceFingerprint(userAgent, ipAddress),
    };
  }

  private isAccountLocked(email: string): boolean {
    const attempts = this.failedAttempts.get(email);
    if (!attempts) return false;

    const now = Date.now();
    const timeSinceLastAttempt = now - attempts.lastAttempt;

    if (timeSinceLastAttempt > this.lockoutDuration) {
      this.failedAttempts.delete(email);
      return false;
    }

    return attempts.count >= this.maxFailedAttempts;
  }

  private recordFailedAttempt(email: string): void {
    const attempts = this.failedAttempts.get(email) || {
      count: 0,
      lastAttempt: 0,
    };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.failedAttempts.set(email, attempts);
  }

  private logSecurityEvent(
    type: SecurityEvent["type"],
    userId: string | undefined,
    schoolId: string | undefined,
    ipAddress: string,
    userAgent: string,
    details: string,
    severity: SecurityEvent["severity"],
  ): void {
    const event: SecurityEvent = {
      type,
      userId,
      schoolId,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
      details,
      severity,
    };

    this.securityEvents.push(event);

    // In real implementation, this would be sent to a security monitoring service
    console.log("Security Event:", event);
  }

  private generateSecureSessionId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private generateDeviceFingerprint(
    userAgent: string,
    ipAddress: string,
  ): string {
    return btoa(`${userAgent}_${ipAddress}_${Date.now()}`);
  }

  private generateMFASecret(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () =>
      Math.random().toString(36).substr(2, 8).toUpperCase(),
    );
  }

  private generateQRCode(email: string, secret: string): string {
    // In real implementation, this would generate an actual QR code
    return `otpauth://totp/${encodeURIComponent(email)}?secret=${secret}&issuer=AnansiAI`;
  }

  private getClientIP(): string {
    // In real implementation, this would get the actual client IP
    return "127.0.0.1";
  }

  private getClientUserAgent(): string {
    return navigator.userAgent;
  }

  private storeSecureSession(session: SecuritySession): void {
    // In real implementation, this would use secure, encrypted storage
    localStorage.setItem("secure_session", JSON.stringify(session));
  }

  private clearSecureStorage(): void {
    localStorage.removeItem("secure_session");
    sessionStorage.clear();
  }

  private invalidateSession(sessionId: string): void {
    // In real implementation, this would invalidate the session on the server
    console.log(`Session ${sessionId} invalidated`);
  }

  private async updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    // In real implementation, this would hash and store the new password
    console.log(`Password updated for user ${userId}`);
  }

  private async storeMFASettings(
    userId: string,
    secret: string,
  ): Promise<void> {
    // In real implementation, this would store MFA settings securely
    console.log(`MFA enabled for user ${userId}`);
  }
}

// Singleton instance
export const secureAuth = new SecureAuthService();

// React hook for using secure authentication
export function useSecureAuth() {
  const login = (credentials: LoginCredentials) => {
    return secureAuth.login(credentials);
  };

  const logout = () => {
    return secureAuth.logout();
  };

  const getCurrentUser = () => {
    return secureAuth.getCurrentUser();
  };

  const hasPermission = (permission: string) => {
    return secureAuth.hasPermission(permission);
  };

  const canAccessSchoolData = (schoolId: string) => {
    return secureAuth.canAccessSchoolData(schoolId);
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    return secureAuth.changePassword(currentPassword, newPassword);
  };

  const enableMFA = () => {
    return secureAuth.enableMFA();
  };

  const getSecurityEvents = () => {
    return secureAuth.getSchoolSecurityEvents();
  };

  return {
    login,
    logout,
    getCurrentUser,
    hasPermission,
    canAccessSchoolData,
    changePassword,
    enableMFA,
    getSecurityEvents,
  };
}
