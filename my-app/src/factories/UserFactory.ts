// FACTORY PATTERN — creates user profile objects based on role

import type { Profile, UserRole } from '../types';

interface StudentProfile extends Profile {
  role: 'student';
}

interface StaffProfile extends Profile {
  role: 'staff';
}

export class UserFactory {
  static createStudent(id: string, name: string, email: string, department: string): StudentProfile {
    return {
      id,
      name,
      email,
      role: 'student',
      department,
      created_at: new Date().toISOString(),
    };
  }

  static createStaff(id: string, name: string, email: string, department: string): StaffProfile {
    return {
      id,
      name,
      email,
      role: 'staff',
      department,
      created_at: new Date().toISOString(),
    };
  }

  static createUser(id: string, name: string, email: string, role: UserRole, department: string): Profile {
    if (role === 'staff') {
      return UserFactory.createStaff(id, name, email, department);
    }
    return UserFactory.createStudent(id, name, email, department);
  }
}
