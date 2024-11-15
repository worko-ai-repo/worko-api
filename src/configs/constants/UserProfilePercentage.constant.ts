export const UserProfilePercentage = {
  candidate: [
    {
      fieldGroup: "personal",
      fieldGroupText: "Personal Info",
      expPerc: 30,
      fields: [
        {
          field: "name",
          fieldText: "Name",
          expPerc: 5,
        },
        {
          field: "isEmailVerified",
          fieldText: "Email-Verify",
          expPerc: 5,
        },
        {
          field: "isNumberVerified",
          fieldText: "Phone No- Verify",
          expPerc: 5,
        },
        {
          field: "collage",
          fieldText: "Collage",
          expPerc: 3,
        },
        {
          field: "about",
          fieldText: "About",
          expPerc: 6,
        },
        {
          field: "socialProfile",
          fieldText: "Social Link",
          expPerc: 3,
        },
        {
          field: "profileImage",
          fieldText: "Profile Pic",
          expPerc: 3,
        },
      ],
    },
    {
      fieldGroup: "professional",
      fieldGroupText: "Professional Info",
      expPerc: 45,
      fields: [
        {
          field: "companyName",
          fieldText: "Company Name",
          expPerc: 5,
        },
        {
          field: "designation",
          fieldText: "Designation",
          expPerc: 6,
        },
        {
          field: "department",
          fieldText: "Department",
          expPerc: 6,
        },
        {
          field: "CTC",
          fieldText: "CTC",
          expPerc: 5, // previously 3
        },
        {
          field: "ECTC",
          fieldText: "ECTC",
          expPerc: 2,
        },
        {
          field: "noticePeriod",
          fieldText: "Notice period",
          expPerc: 4, // previously 2
        },
        {
          field: "certifications",
          fieldText: "Certificates",
          expPerc: 2,
        },
        {
          field: "softSkills",
          fieldText: "Soft skill",
          expPerc: 5, // previously 7
        },
        {
          field: "coreSkills",
          fieldText: "Core skill",
          expPerc: 5, // previously 7
        },
        {
          field: "achievements",
          fieldText: "Achievements",
          expPerc: 5,
        },
      ],
    },
    {
      fieldGroup: "CV",
      fieldGroupText: "CV",
      expPerc: 25,
      fields: [
        {
          field: "CV",
          fieldText: "CV",
          expPerc: 25,
        },
      ],
    },
  ],
  employee: [
    {
      fieldGroup: "personal",
      fieldGroupText: "Personal Info",
      expPerc: 40,
      fields: [
        {
          field: "name",
          fieldText: "Name",
          expPerc: 4,
        },
        {
          field: "isEmailVerified",
          fieldText: "Email-Verify",
          expPerc: 8,
        },
        {
          field: "isNumberVerified",
          fieldText: "Phone No- Verify",
          expPerc: 6, // previously 8
        },
        {
          field: "about",
          fieldText: "About",
          expPerc: 10, // previously 8
        },
        {
          field: "socialProfile",
          fieldText: "Social Link",
          expPerc: 6, 
        },
        {
          field: "profileImage",
          fieldText: "Profile Pic",
          expPerc: 6,
        },
      ],
    },
    {
      fieldGroup: "professional",
      fieldGroupText: "Professional Info",
      expPerc: 40,
      fields: [
        {
          field: "companyName",
          fieldText: "Company Name",
          expPerc: 8, // previuously 6
        },
        {
          field: "isEmailVerified",
          fieldText: "Official Mail - Verify",
          expPerc: 10, // previously 12
        },
        {
          field: "designation",
          fieldText: "Designation",
          expPerc: 8, // previously 6
        },
        {
          field: "department",
          fieldText: "Department",
          expPerc: 8,
        },
        {
          field: "experienceInMonths",
          fieldText: "Working since",
          expPerc: 6, 
        },
        {
          field: "bankDetails",
          fieldText: "Bank Detail",
          expPerc: 0, // previously 2
        },
      ],
    },
    {
      fieldGroup: "package",
      fieldGroupText: "Package",
      expPerc: 20,
      fields: [
        {
          field: "Choose availability",
          fieldText: "Choose availability",
          expPerc: 10,
        },
        {
          field: "Choose Notice period",
          fieldText: "Choose Notice period",
          expPerc: 2,
        },
        {
          field: "Choose duration & Fees",
          fieldText: "Choose duration & Fees",
          expPerc: 8,
        },
      ],
    },
  ],
};

export const profilePercentageField = {
  isEmailVerified: "isEmailVerified",
  isNumberVerified: "isNumberVerified",
  socialProfile: "socialProfile", 
  CV: "CV",
};