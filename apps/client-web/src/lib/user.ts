import type { User } from "@prisma/client";

export class UserUtils {
  static splitName(fullName: User["name"]): {
    firstName: string;
    lastName: string;
  } {
    const [lastName, firstName] = fullName.split(",");
    return { firstName: firstName!.trim(), lastName: lastName!.trim() };
  }

  static getInitials(fullName: User["name"]): {
    firstName: string;
    lastName: string;
  } {
    const { firstName, lastName } = this.splitName(fullName);

    return {
      firstName: firstName.charAt(0).toUpperCase(),
      lastName: lastName.charAt(0).toUpperCase(),
    };
  }
}
