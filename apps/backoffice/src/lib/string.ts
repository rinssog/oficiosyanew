export class StringUtils {
  static toTitleCase(input: string): string {
    return input
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => this.firstToUppercase(w))
      .join(" ");
  }

  static firstToUppercase(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
}
