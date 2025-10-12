// lib/applyAutofill.ts
import type {
  Basics, Military, Security, Address, Employment, TrustedContact
} from "./signupSchemas"

type Actions = {
  setBasics: (p: Partial<Basics>) => void
  setMilitary: (p: Partial<Military>) => void
  setSecurity: (p: Partial<Security>) => void
  setAddress: (p: Partial<Address>) => void
  setEmployment: (p: Partial<Employment>) => void
  setTrusted: (p: Partial<TrustedContact>) => void
}

export type AutofillPayload = {
  basics?: Partial<Basics>
  military?: Partial<Military>
  security?: Partial<Security>
  address?: Partial<Address>
  employment?: Partial<Employment>
  trusted?: Partial<TrustedContact>
}

/**
 * Apply AI autofill to the signup store.
 * Call this inside a React component where you can access your store actions.
 */
export function applyAutofill(autofill: AutofillPayload, actions: Actions) {
  const {
    setBasics, setMilitary, setSecurity,
    setAddress, setEmployment, setTrusted
  } = actions

  if (autofill.basics) setBasics(cleanStrings(autofill.basics))
  if (autofill.military) setMilitary(cleanStrings(autofill.military))
  if (autofill.security) setSecurity(cleanStrings(autofill.security))
  if (autofill.address) setAddress(cleanStrings(autofill.address))
  if (autofill.employment) setEmployment(cleanStrings(autofill.employment))
  if (autofill.trusted) setTrusted(cleanStrings(autofill.trusted))
}

function cleanStrings<T extends Record<string, any>>(obj: Partial<T>): Partial<T> {
  const out: any = {}
  for (const k in obj) {
    const v = (obj as any)[k]
    out[k] = typeof v === "string" ? v.trim() : v
  }
  return out
}
