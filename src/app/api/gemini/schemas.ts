export const BasicsSchema = {
  firstName: "",
  middleName: "",
  lastName: "",
  preferredName: "",
  email: "",
  phone: ""
};

export const MilitarySchema = {
    hasService: null,
    status: "",
    branch: "",
    rank: ""
};

export const SecuritySchema = {
  dob: "",
  citizenship: "",
};

export const AddressSchema = {
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: ""
};

export const EmploymentSchema = {
    status: "",
    title: "",
    employer: "",
    isRegAffiliated: null,
    regFirmName: "",
    isInsider: null,
    insiderCompany: "",
    irsBackupWitholding: null
};

export const TrustedConstactSchema = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    skip: false
};