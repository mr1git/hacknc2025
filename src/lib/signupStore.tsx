// src/lib/signupStore.tsx
"use client"

import React, { createContext, useContext, useMemo, useState } from "react"
import {
  BasicsSchema, MilitarySchema, SecuritySchema, AddressSchema, EmploymentSchema, TrustedContactSchema,
  type Basics, type Military, type Security, type Address, type Employment, type TrustedContact
} from "./signupSchemas"

type ContextShape = {
  basics: Basics
  military: Military
  security: Security
  address: Address
  employment: Employment
  trusted: TrustedContact
  setBasics: (p: Partial<Basics>) => void
  setMilitary: (p: Partial<Military>) => void
  setSecurity: (p: Partial<Security>) => void
  setAddress: (p: Partial<Address>) => void
  setEmployment: (p: Partial<Employment>) => void
  setTrusted: (p: Partial<TrustedContact>) => void
}

const SignupCtx = createContext<ContextShape | null>(null)

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [basics, setBasicsState] = useState<Basics>({ ...BasicsSchema })
  const [military, setMilitaryState] = useState<Military>({ ...MilitarySchema })
  const [security, setSecurityState] = useState<Security>({ ...SecuritySchema })
  const [address, setAddressState] = useState<Address>({ ...AddressSchema })
  const [employment, setEmploymentState] = useState<Employment>({ ...EmploymentSchema })
  const [trusted, setTrustedState] = useState<TrustedContact>({ ...TrustedContactSchema })

  const value = useMemo<ContextShape>(() => ({
    basics, military, security, address, employment, trusted,
    setBasics: p => setBasicsState(s => ({ ...s, ...p })),
    setMilitary: p => setMilitaryState(s => ({ ...s, ...p })),
    setSecurity: p => setSecurityState(s => ({ ...s, ...p })),
    setAddress: p => setAddressState(s => ({ ...s, ...p })),
    setEmployment: p => setEmploymentState(s => ({ ...s, ...p })),
    setTrusted: p => setTrustedState(s => ({ ...s, ...p })),
  }), [basics, military, security, address, employment, trusted])

  return <SignupCtx.Provider value={value}>{children}</SignupCtx.Provider>
}

export function useSignupStore() {
  const ctx = useContext(SignupCtx)
  if (!ctx) throw new Error("useSignupStore must be used within <SignupProvider>")
  return ctx
}
