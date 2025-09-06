import axiosClient from './axiosClient';

export interface TeacherData {
  userId: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  subject?: string;
  institutionId?: number;
  role?: string;
}

export interface TeacherSubject {
  subjectId: number;
  subjectName: string;
  levelId?: number;
  teacherId: string;
  milestones: any[];
  goals: any[];
}

export interface CurriculumData {
  curriculumId: number;
  name: string;
  description: string;
  institutionId: number;
}

export interface TermData {
  termId: number;
  termName: string;
  institutionId: number;
}

export class TeacherService {
  /**
   * Get teacher information by email from multiple sources
   */
  static async getTeacherByEmail(email: string): Promise<TeacherData | null> {
    try {
      console.log("🔍 Getting teacher data for email:", email);

      // Use JWT token data directly instead of calling forbidden admin endpoints
      const authToken = localStorage.getItem("anansi_token");
      if (authToken && email) {
        try {
          const payload = JSON.parse(atob(authToken.split('.')[1]));
          console.log("📋 Extracting teacher data from JWT token:", payload);

          const institutionId = payload.institutionId;

          // Extract teacher name from various JWT token fields
          let teacherFirstName = payload.firstName || payload.given_name || payload.first_name || '';
          let teacherLastName = payload.lastName || payload.family_name || payload.last_name || '';
          let teacherFullName = payload.name || payload.unique_name || payload.preferred_username || '';

          // Try to extract name from email if no other name is available
          if (!teacherFirstName && !teacherLastName && !teacherFullName) {
            const emailName = email.split('@')[0];
            // Convert email name like "john.doe" or "john_doe" to "John Doe"
            const nameParts = emailName.replace(/[._]/g, ' ').split(' ');
            if (nameParts.length >= 2) {
              teacherFirstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
              teacherLastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
              teacherFullName = `${teacherFirstName} ${teacherLastName}`;
            } else if (nameParts.length === 1) {
              teacherFirstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
              teacherFullName = teacherFirstName;
            }
          }

          // Build final name
          if (!teacherFullName) {
            teacherFullName = `${teacherFirstName} ${teacherLastName}`.trim();
          }

          if (!teacherFullName) {
            teacherFullName = 'Teacher';
          }

          const teacherFromToken = {
            userId: payload.sub || payload.userId || payload.id || 'token_user',
            id: payload.sub || payload.userId || payload.id || 'token_user',
            firstName: teacherFirstName,
            lastName: teacherLastName,
            email: email,
            name: teacherFullName,
            institutionId: payload.institutionId || institutionId,
            role: 'Teacher'
          };

          console.log("✅ Created teacher from token:", teacherFromToken);
          return teacherFromToken;
        } catch (tokenError) {
          console.log("⚠️ Failed to parse token for teacher data:", tokenError);
        }
      }

      // Try localStorage fallback
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          if (parsedData.email && parsedData.email.toLowerCase() === email.toLowerCase()) {
            console.log("✅ Using teacher data from localStorage:", parsedData);
            const formattedTeacher = this.formatTeacherData(parsedData, institutionId);
            console.log("✅ Formatted teacher from localStorage:", formattedTeacher);
            return formattedTeacher;
          }
        } catch (error) {
          console.error("❌ Error parsing localStorage userData:", error);
        }
      }

      console.log("⚠️ No teacher data found from any source for email:", email);
      return null;
    } catch (error) {
      console.error("❌ Error fetching teacher data:", error);
      return null;
    }
  }

  /**
   * Format teacher data consistently
   */
  private static formatTeacherData(rawData: any, institutionId?: number): TeacherData {
    const firstName = rawData.firstName || rawData.first_name || '';
    const lastName = rawData.lastName || rawData.last_name || '';
    let name = `${firstName} ${lastName}`.trim();

    // If no first/last name, try to extract from full name or other fields
    if (!name && rawData.fullName) {
      name = rawData.fullName;
    } else if (!name && rawData.name) {
      name = rawData.name;
    } else if (!name && rawData.userName) {
      name = rawData.userName;
    }

    // Final fallback
    if (!name || name === '') {
      name = 'Teacher';
    }

    return {
      userId: rawData.userId || rawData.id || rawData.teacherId || 'unknown',
      id: rawData.id || rawData.userId || rawData.teacherId || 'unknown',
      firstName,
      lastName,
      email: rawData.email || '',
      name,
      subject: rawData.subject || 'Not Assigned',
      institutionId: rawData.institutionId || institutionId,
      role: rawData.role || 'Teacher'
    };
  }

  /**
   * Get teacher's subjects with milestones and goals
   */
  static async getTeacherSubjectsWithCurriculum(curriculumId: number, termId: number): Promise<{
    success: boolean;
    data?: TeacherSubject[];
    subjects?: TeacherSubject[];
    milestones?: any[];
    goals?: any[];
    error?: string;
  }> {
    try {
      console.log("📚 Fetching teacher subjects with curriculum data...", { curriculumId, termId });
      console.log("🔍 Using endpoint: /api/teachers/teacher-subjects-with-milestones-and-goals");

      // Get current teacher information for filtering
      const token = localStorage.getItem("anansi_token");
      let teacherId = null;
      let institutionId = null;

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          teacherId = payload.sub || payload.userId;
          institutionId = payload.institutionId;
          console.log("🔍 Teacher context for API call:", { teacherId, institutionId, curriculumId, termId });
        } catch (e) {
          console.log("⚠️ Could not parse token for teacher context");
        }
      }

      // Try the primary endpoint from API documentation
      const response = await axiosClient.get("/api/teachers/teacher-subjects-with-milestones-and-goals", {
        params: { curriculumId, termId }
      });

      console.log("🔍 API Response Debug:", {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataType: typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array',
        fullResponse: response.data,
        requestParams: { curriculumId, termId }
      });

      // Handle different response structures
      let subjects = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          subjects = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          subjects = response.data.data;
        } else if (response.data.subjects && Array.isArray(response.data.subjects)) {
          subjects = response.data.subjects;
        } else {
          console.log("📊 Single subject response, converting to array");
          subjects = [response.data];
        }
      }

      console.log("📊 Processed subjects:", {
        subjectsFound: subjects.length,
        subjects: subjects.map(s => ({
          subjectId: s.subjectId || s.id,
          subjectName: s.subjectName || s.name || s.subject?.name,
          teacherId: s.teacherId,
          keys: Object.keys(s)
        }))
      });

      if (subjects.length > 0) {
        const allMilestones: any[] = [];
        const allGoals: any[] = [];

        console.log("🔍 Raw API response structure:", {
          dataLength: subjects.length,
          firstSubject: subjects[0],
          hasSubjects: !!subjects.length,
          subjectProperties: subjects[0] ? Object.keys(subjects[0]) : [],
          rawMilestones: subjects[0]?.milestones,
          rawGoals: subjects[0]?.goals
        });

        // Filter subjects for current teacher if teacherId is available
        let teacherSpecificSubjects = subjects;
        if (teacherId) {
          teacherSpecificSubjects = subjects.filter((subject: any) =>
            subject.teacherId === teacherId ||
            !subject.teacherId  // Include subjects without specific teacher assignment
          );
          console.log(`🔍 Filtered subjects for teacher ${teacherId}: ${teacherSpecificSubjects.length} of ${subjects.length} total`);
        }

        // Process each subject and extract milestones/goals
        const processedSubjects = teacherSpecificSubjects.map((subject: any) => {
          console.log("🔍 Processing subject:", {
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            allKeys: Object.keys(subject),
            milestones: subject.milestones,
            goals: subject.goals,
            hasMilestonesProperty: 'milestones' in subject,
            hasGoalsProperty: 'goals' in subject
          });

          const subjectData = {
            subjectId: subject.subjectId || subject.id,
            subjectName: subject.subjectName || subject.name || subject.subject?.name || `Subject ${subject.subjectId || subject.id}`,
            levelId: subject.levelId,
            teacherId: subject.teacherId,
            milestones: [],
            goals: []
          };

          // Look for milestones in various possible property names
          const milestonesArray = subject.milestones || subject.Milestones || subject.milestonesProperty || subject.subjectMilestones || [];
          console.log("🔍 Milestones check:", {
            found: !!milestonesArray,
            type: typeof milestonesArray,
            length: Array.isArray(milestonesArray) ? milestonesArray.length : 'not array',
            data: milestonesArray
          });

          if (Array.isArray(milestonesArray) && milestonesArray.length > 0) {
            subjectData.milestones = milestonesArray;
            allMilestones.push(...milestonesArray.map((m: any) => ({
              ...m,
              subjectId: subject.subjectId,
              subjectName: subjectData.subjectName
            })));
          }

          // Look for goals in various possible property names
          const goalsArray = subject.goals || subject.Goals || subject.goalsProperty || subject.subjectGoals || [];
          console.log("🔍 Goals check:", {
            found: !!goalsArray,
            type: typeof goalsArray,
            length: Array.isArray(goalsArray) ? goalsArray.length : 'not array',
            data: goalsArray
          });

          if (Array.isArray(goalsArray) && goalsArray.length > 0) {
            subjectData.goals = goalsArray;
            allGoals.push(...goalsArray.map((g: any) => ({
              ...g,
              subjectId: subject.subjectId,
              subjectName: subjectData.subjectName
            })));
          }

          return subjectData;
        });

        console.log(`✅ Processed ${processedSubjects.length} subjects, ${allMilestones.length} milestones, ${allGoals.length} goals`);

        // If no milestones/goals found, try to fetch them separately
        if (allMilestones.length === 0 && allGoals.length === 0 && processedSubjects.length > 0) {
          console.log("⚠️ No milestones/goals found in API response, trying to fetch separately...");

          try {
            const subjectIds = processedSubjects.map(s => s.subjectId);
            console.log("🔍 Fetching milestones and goals for subject IDs:", subjectIds);

            // Try to fetch milestones and goals from their individual endpoints
            const [milestonesRes, goalsRes] = await Promise.allSettled([
              axiosClient.get("/api/milestones"),
              axiosClient.get("/api/goals")
            ]);

            if (milestonesRes.status === 'fulfilled' && milestonesRes.value.data) {
              const filteredMilestones = milestonesRes.value.data.filter((m: any) => {
                const matchesSubject = subjectIds.includes(m.subjectId);
                const matchesCurriculum = (m.curriculumId === curriculumId || !m.curriculumId);
                const matchesTerm = (m.termId === termId || !m.termId);
                const matchesInstitution = (!institutionId || m.institutionId === institutionId || !m.institutionId);

                console.log(`🔍 Milestone ${m.milestoneId || m.id}: subject=${matchesSubject}, curriculum=${matchesCurriculum}, term=${matchesTerm}, institution=${matchesInstitution}`);

                return matchesSubject && matchesCurriculum && matchesTerm && matchesInstitution;
              });
              console.log(`📋 Found ${filteredMilestones.length} milestones from separate endpoint for teacher's subjects`);
              allMilestones.push(...filteredMilestones);
            }

            if (goalsRes.status === 'fulfilled' && goalsRes.value.data) {
              const filteredGoals = goalsRes.value.data.filter((g: any) => {
                const matchesSubject = subjectIds.includes(g.subjectId);
                const matchesCurriculum = (g.curriculumId === curriculumId || !g.curriculumId);
                const matchesTerm = (g.termId === termId || !g.termId);
                const matchesInstitution = (!institutionId || g.institutionId === institutionId || !g.institutionId);

                console.log(`🔍 Goal ${g.goalId || g.id}: subject=${matchesSubject}, curriculum=${matchesCurriculum}, term=${matchesTerm}, institution=${matchesInstitution}`);

                return matchesSubject && matchesCurriculum && matchesTerm && matchesInstitution;
              });
              console.log(`🎯 Found ${filteredGoals.length} goals from separate endpoint for teacher's subjects`);
              allGoals.push(...filteredGoals);
            }

            // Update subjects with found milestones and goals
            processedSubjects.forEach(subject => {
              subject.milestones = allMilestones.filter(m => m.subjectId === subject.subjectId);
              subject.goals = allGoals.filter(g => g.subjectId === subject.subjectId);
            });

            // Always return real data, even if empty
            console.log(`✅ Returning real API data: ${allMilestones.length} milestones, ${allGoals.length} goals`);
            return {
              success: true,
              data: processedSubjects,
              subjects: processedSubjects,
              milestones: allMilestones,
              goals: allGoals
            };
          } catch (separateError) {
            console.log("⚠️ Failed to fetch milestones/goals separately:", separateError.message);

            // Return subjects without milestones/goals rather than generating fake data
            return {
              success: true,
              data: processedSubjects,
              subjects: processedSubjects,
              milestones: [],
              goals: []
            };
          }
        }

        return {
          success: true,
          data: processedSubjects,
          subjects: processedSubjects,
          milestones: allMilestones,
          goals: allGoals
        };
      }

      console.log("⚠️ No subjects found in API response");
      return { success: false, error: "No subjects found in API response" };

    } catch (error) {
      console.log("⚠️ Primary endpoint failed, trying fallback approach:", error.message);

      // Fallback approach: get subject assignments and then fetch milestones/goals separately
      return this.getFallbackSubjectsWithCurriculum(curriculumId, termId);
    }
  }

  /**
   * Fallback method to get subjects with separate milestones and goals calls
   */
  private static async getFallbackSubjectsWithCurriculum(curriculumId: number, termId: number): Promise<{
    success: boolean;
    data?: TeacherSubject[];
    subjects?: TeacherSubject[];
    milestones?: any[];
    goals?: any[];
    error?: string;
  }> {
    try {
      console.log("🔄 Attempting fallback approach with separate API calls...");

      // Get basic subject assignments
      const subjectsResponse = await axiosClient.get("/api/subject-assignments");

      let subjects: TeacherSubject[] = [];
      if (subjectsResponse.data && Array.isArray(subjectsResponse.data)) {
        subjects = subjectsResponse.data.map((assignment: any) => ({
          subjectId: assignment.subjectId,
          subjectName: assignment.subjectName || assignment.subject?.name || `Subject ${assignment.subjectId}`,
          levelId: assignment.levelId,
          teacherId: assignment.teacherId,
          milestones: [],
          goals: []
        }));
      }

      // Fetch milestones and goals separately
      const [milestonesRes, goalsRes] = await Promise.allSettled([
        axiosClient.get("/api/milestones"),
        axiosClient.get("/api/goals")
      ]);

      const allMilestones = milestonesRes.status === 'fulfilled' ? milestonesRes.value.data || [] : [];
      const allGoals = goalsRes.status === 'fulfilled' ? goalsRes.value.data || [] : [];

      const subjectIds = subjects.map(s => s.subjectId);

      // Filter milestones and goals for teacher's subjects
      const relevantMilestones = allMilestones.filter((m: any) =>
        subjectIds.includes(m.subjectId)
      );

      const relevantGoals = allGoals.filter((g: any) =>
        subjectIds.includes(g.subjectId)
      );

      console.log(`✅ Fallback loaded ${subjects.length} subjects, ${relevantMilestones.length} milestones, ${relevantGoals.length} goals`);

      return {
        success: true,
        data: subjects,
        subjects,
        milestones: relevantMilestones,
        goals: relevantGoals
      };

    } catch (error) {
      console.error("❌ Fallback approach also failed:", error);

      // Return empty real data instead of mock data
      return {
        success: false,
        error: "Could not fetch teacher subjects from any endpoint",
        data: [],
        subjects: [],
        milestones: [],
        goals: []
      };
    }
  }

  /**
   * Get curriculum data for institution
   */
  static async getCurriculumData(institutionId?: number): Promise<{ curriculumId: number; termId: number; }> {
    try {
      if (institutionId) {
        const [curriculumRes, termRes] = await Promise.allSettled([
          axiosClient.get(`/api/curriculums/by-institution?institutionId=${institutionId}`),
          axiosClient.get(`/api/terms/by-institution?institutionId=${institutionId}`)
        ]);

        const curriculumId = curriculumRes.status === 'fulfilled' && curriculumRes.value.data?.length > 0
          ? curriculumRes.value.data[0].curriculumId
          : 1;

        const termId = termRes.status === 'fulfilled' && termRes.value.data?.length > 0
          ? termRes.value.data[0].termId
          : 1;

        console.log("✅ Found curriculum data:", { curriculumId, termId, institutionId });
        return { curriculumId, termId };
      }

      // Global fallback
      const [curriculumRes, termRes] = await Promise.allSettled([
        axiosClient.get("/api/curriculums"),
        axiosClient.get("/api/terms")
      ]);

      const curriculumId = curriculumRes.status === 'fulfilled' && curriculumRes.value.data?.length > 0
        ? curriculumRes.value.data[0].curriculumId
        : 1;

      const termId = termRes.status === 'fulfilled' && termRes.value.data?.length > 0
        ? termRes.value.data[0].termId
        : 1;

      console.log("✅ Found global curriculum data:", { curriculumId, termId });
      return { curriculumId, termId };

    } catch (error) {
      console.log("⚠️ Could not fetch curriculum data, using defaults:", error.message);
      return { curriculumId: 1, termId: 1 };
    }
  }


}
