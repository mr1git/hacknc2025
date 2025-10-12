"use client"
import React, { useMemo, useState } from "react"
import { SignupCtx, type ContextShape } from "@/src/lib/signupContext"
import {
  BasicsSchema, MilitarySchema, SecuritySchema, AddressSchema, EmploymentSchema, TrustedContactSchema,
  type Basics, type Military, type Security, type Address, type Employment, type TrustedContact
} from "@/src/lib/signupSchemas"

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
