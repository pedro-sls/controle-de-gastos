export const REGISTRATION_MODES = ["open", "invite_only"] as const;

export type RegistrationMode = (typeof REGISTRATION_MODES)[number];

const REGISTRATION_MODE_VARIABLE = "REGISTRATION_MODE";

export function getRegistrationMode(): RegistrationMode {
  const configuredMode = process.env.REGISTRATION_MODE?.trim();

  if (!configuredMode) {
    return process.env.NODE_ENV === "production" ? "invite_only" : "open";
  }

  if (!REGISTRATION_MODES.includes(configuredMode as RegistrationMode)) {
    throw new Error(
      `${REGISTRATION_MODE_VARIABLE} deve ser "open" ou "invite_only".`,
    );
  }

  return configuredMode as RegistrationMode;
}

export function isOpenRegistration() {
  return getRegistrationMode() === "open";
}
