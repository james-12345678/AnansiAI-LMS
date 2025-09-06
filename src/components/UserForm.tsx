import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import axiosClient from "@/services/axiosClient";
import { adminApiService } from "@/services/adminApiService";

interface UserFormProps {
  user?: any;
  onSave: (userData: any) => void;
  onCancel: () => void;
  institutionId?: number;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, institutionId }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phoneNumber: "",
    institutionId: "",
    role: { id: "", name: "" },
    selectedSubjectId: "",
    selectedLevelId: "",
  });

  const [institutions, setInstitutions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [levelsLoading, setLevelsLoading] = useState(false);

  useEffect(() => {
    // Fetch institutions and roles
    fetchInstitutions();
    fetchRoles();

    // Pre-fill form if editing user
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        address: user.address || "",
        phoneNumber: user.phoneNumber || "",
        institutionId: user.institutionId || "",
        role: {
          id: user.role?.id || "",
          name: user.role?.name || user.role || "",
        },
        selectedSubjectId: user.selectedSubjectId || "",
        selectedLevelId: user.selectedLevelId || "",
      });
    }
  }, [user]);

  // Fetch subjects and levels when institution is selected or role is teacher
  useEffect(() => {
    const currentInstitutionId = institutionId || formData.institutionId;
    if (currentInstitutionId && formData.role.name.toLowerCase() === "teacher") {
      fetchSubjects(parseInt(currentInstitutionId.toString()));
      fetchLevels(parseInt(currentInstitutionId.toString()));
    }
  }, [formData.institutionId, formData.role.name, institutionId]);

  const fetchInstitutions = async () => {
    try {
      const response = await axiosClient.get("/api/Institutions");
      const institutionsData = response.data.data || response.data || [];
      setInstitutions(institutionsData);
    } catch (error) {
      console.error("Failed to fetch institutions:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosClient.get("/api/Users/all-roles");
      const rolesData = response.data.data || response.data || [];
      setRoles(rolesData);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      // Fallback to hardcoded roles if API is not available
      const fallbackRoles = [
        { id: "1", name: "SuperAdmin" },
        { id: "2", name: "Admin" },
        { id: "3", name: "Teacher" },
        { id: "4", name: "Student" },
      ];
      setRoles(fallbackRoles);
      console.log("📋 Using fallback roles:", fallbackRoles);
    }
  };

  const fetchSubjects = async (instId: number) => {
    try {
      setSubjectsLoading(true);
      console.log("🔄 Fetching subjects for institution:", instId);
      const subjectsData = await adminApiService.getSubjectsByInstitution(instId);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      console.log("✅ Subjects fetched:", subjectsData);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchLevels = async (instId: number) => {
    try {
      setLevelsLoading(true);
      console.log("🔄 Fetching levels for institution:", instId);
      const levelsData = await adminApiService.getLevelsByInstitution(instId);
      setLevels(Array.isArray(levelsData) ? levelsData : []);
      console.log("✅ Levels fetched:", levelsData);
    } catch (error) {
      console.error("Failed to fetch levels:", error);
      // Fallback to default levels if API fails
      const fallbackLevels = [
        { levelId: 1, levelName: "Grade 1" },
        { levelId: 2, levelName: "Grade 2" },
        { levelId: 3, levelName: "Grade 3" },
        { levelId: 4, levelName: "Grade 4" },
        { levelId: 5, levelName: "Grade 5" },
        { levelId: 6, levelName: "Grade 6" },
        { levelId: 7, levelName: "Grade 7" },
        { levelId: 8, levelName: "Grade 8" },
        { levelId: 9, levelName: "Grade 9" },
        { levelId: 10, levelName: "Grade 10" },
        { levelId: 11, levelName: "Grade 11" },
        { levelId: 12, levelName: "Grade 12" },
      ];
      setLevels(fallbackLevels);
      console.log("📋 Using fallback levels:", fallbackLevels);
    } finally {
      setLevelsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoleChange = (roleId: string) => {
    const selectedRole = roles.find((role: any) => role.id === roleId);
    const roleName = selectedRole?.name || "";

    setFormData((prev) => ({
      ...prev,
      role: {
        id: roleId,
        name: roleName,
      },
      // Reset subject and level selection when role changes
      selectedSubjectId: "",
      selectedLevelId: "",
    }));

    // Fetch subjects and levels if teacher role is selected and institution is available
    const currentInstitutionId = institutionId || formData.institutionId;
    if (roleName.toLowerCase() === "teacher" && currentInstitutionId) {
      fetchSubjects(parseInt(currentInstitutionId.toString()));
      fetchLevels(parseInt(currentInstitutionId.toString()));
    }
  };

  const handleInstitutionChange = (instId: string) => {
    setFormData((prev) => ({
      ...prev,
      institutionId: instId,
      // Reset subject and level selection when institution changes
      selectedSubjectId: "",
      selectedLevelId: "",
    }));

    // Fetch subjects and levels if teacher role is selected
    if (formData.role.name.toLowerCase() === "teacher" && instId) {
      fetchSubjects(parseInt(instId));
      fetchLevels(parseInt(instId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.role.id
    ) {
      alert("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Additional validation for teacher role
    if (formData.role.name.toLowerCase() === "teacher") {
      if (!formData.selectedSubjectId) {
        alert("Please select a subject for the teacher");
        setLoading(false);
        return;
      }
      if (!formData.selectedLevelId) {
        alert("Please select a level for the teacher");
        setLoading(false);
        return;
      }
    }

    onSave(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="institution">Institution</Label>
        <Select
          value={formData.institutionId.toString()}
          onValueChange={handleInstitutionChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select institution" />
          </SelectTrigger>
          <SelectContent>
            {institutions.map((institution: any) => (
              <SelectItem
                key={institution.institutionId || institution.id}
                value={(institution.institutionId || institution.id).toString()}
              >
                {institution.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select value={formData.role.id} onValueChange={handleRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role: any) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject and Level selection for Teacher role */}
      {formData.role.name.toLowerCase() === "teacher" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select
              value={formData.selectedSubjectId}
              onValueChange={(value) => handleInputChange("selectedSubjectId", value)}
              disabled={subjectsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={subjectsLoading ? "Loading subjects..." : "Select subject"} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem
                    key={subject.subjectId}
                    value={subject.subjectId.toString()}
                  >
                    {subject.subjectName}
                  </SelectItem>
                ))}
                {subjects.length === 0 && !subjectsLoading && (
                  <SelectItem value="" disabled>
                    No subjects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level *</Label>
            <Select
              value={formData.selectedLevelId}
              onValueChange={(value) => handleInputChange("selectedLevelId", value)}
              disabled={levelsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={levelsLoading ? "Loading levels..." : "Select level"} />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level: any) => (
                  <SelectItem
                    key={level.levelId}
                    value={level.levelId.toString()}
                  >
                    {level.levelName}
                  </SelectItem>
                ))}
                {levels.length === 0 && !levelsLoading && (
                  <SelectItem value="" disabled>
                    No levels available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : user ? "Update User" : "Create User"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default UserForm;
