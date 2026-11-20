const minSnowflake = BigInt(4194304);
const maxSnowflake = BigInt("18446744073709551615");

export function isSnowflake(snowflake: string): boolean {
  if (snowflake.length < 7 || snowflake.length > 20 || snowflake.startsWith("0") || /\D/.test(snowflake)) return false;
  const value = BigInt(snowflake);
  return value > minSnowflake && value <= maxSnowflake;
}
