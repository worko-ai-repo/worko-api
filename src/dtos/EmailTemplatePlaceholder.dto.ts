export interface EmailTemplatePlaceholderCAND_REFERRAL_REQ_ACCEPTED {
    candName: string;
    companyName: string;
    refereeName: string;
}

export interface EmailTemplatePlaceholderCAND_REFERRAL_REQ_COMPLETED {
    candName: string;
    companyName: string;
}

export interface EmailTemplatePlaceholderCAND_WELCOME_MSG {
    candName: string;
}

export interface EmailTemplatePlaceholderCAND_PROFILE_COMPLETION_REMINDER {
    candName: string;
}

export interface EmailTemplatePlaceholderUSER_WORK_EMAIL_VERIFICATION_OTP {
    userFullName: string;
    otp: string;
}

export interface EmailTemplatePlaceholderCAND_PREMIUM_UPGRADE_NOTIFICATION {
    candName: string;
    candPremiumUpgradeNowMsg: string;
}

export interface EmailTemplatePlaceholderCAND_PROFILE_SWITCH_NOTIFICATION {
    candName: string;
}

export interface EmailTemplatePlaceholderEMP_WELCOME_MSG {
    empName: string;
}

export interface EmailTemplatePlaceholderEMP_PROFILE_COMPLETION_REMINDER {
    empName: string;
}

export interface EmailTemplatePlaceholderEMP_ACCEPTED_REFERRAL_REQ_NOTIFCATION {
    empName: string;
    candName: string;
}

export interface EmailTemplatePlaceholderEMP_REFFERAL_DONE_FOR_CAND {
    empName: string;
}

export interface EmailTemplatePlaceholderCAND_PREMIUM_EXPIRED_NOTIFICATION {
    candName: string;
    candRenewNowMsg: string;
}

export interface EmailTemplatePlaceholderEMP_SWITCH_PROFILE_NOTIFICATION {
    empName: string;
}

export interface EmailTemplatePlaceholderEMP_REVIEW_RATING_BY_CAND {
    empName: string;
    feedback: string;
    rating: number;
}

export interface EmailTemplatePlaceholderEMP_QUERY_FOR_REFERRAL_BY_CAND {
    empName: string;
    query: string;
}