// lib/signupSchemas.ts
export type Basics = {
  firstName: string
  middleName: string
  lastName: string
  preferredName: string
  email: string
  phone: string
}

export const BasicsSchema: Basics = {
  firstName: "",
  middleName: "",
  lastName: "",
  preferredName: "",
  email: "",
  phone: ""
}

export type Military = {
  hasService: boolean | null
  status: string
  branch: string
  rank: string
}

export const MilitarySchema: Military = {
  hasService: null,
  status: "",
  branch: "",
  rank: ""
}

export type Security = {
  dob: string
  citizenship: string
}

export const SecuritySchema: Security = {
  dob: "",
  citizenship: ""
}

export type Address = {
  line1: string
  line2: string
  city: string
  state: string
  zip: string
}

export const AddressSchema: Address = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: ""
}

export type Employment = {
  status: string
  title: string
  employer: string
  isRegAffiliated: boolean | null
  regFirmName: string
  isInsider: boolean | null
  insiderCompany: string
  irsBackupWitholding: boolean | null
}

export const EmploymentSchema: Employment = {
  status: "",
  title: "",
  employer: "",
  isRegAffiliated: null,
  regFirmName: "",
  isInsider: null,
  insiderCompany: "",
  irsBackupWitholding: null
}

// looks like a typo in your name. keeping original but exporting a cleaner alias too
export type TrustedContact = {
  firstName: string
  lastName: string
  phone: string
  email: string
  skip: boolean
}

export const TrustedConstactSchema: TrustedContact = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  skip: false
}
export const TrustedContactSchema = TrustedConstactSchema

