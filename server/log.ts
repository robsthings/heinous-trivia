export function log(message: string, context?: string) {
  const tag = context ? `[${context}]` : "";
  console.log(`${tag} ${message}`);
}
