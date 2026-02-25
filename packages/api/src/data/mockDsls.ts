import { DslListConfig, TdmRecipeConfig } from '../types/domain';

export const mockDslGroups: Record<string, DslListConfig> = {
  TestDataFlavorsBANK: {
    lob: 'BANK',
    type: 'flavor',
    items: [
      {
        id: 'rule-customer-type',
        key: 'customer-type',
        regexString:
          '^customer-type:(primary-user|authorized-user|company|retail)$',
        suggestions: [
          'customer-type:primary-user',
          'customer-type:authorized-user',
          'customer-type:company',
          'customer-type:retail',
        ],
      },
      {
        id: 'rule-account-type',
        key: 'account-type',
        regexString:
          '^account-type:(checking|savings|credit-card|debit-card|business|line-of-credit)$',
        suggestions: [
          'account-type:checking',
          'account-type:savings',
          'account-type:credit-card',
          'account-type:debit-card',
          'account-type:business',
          'account-type:line-of-credit',
        ],
      },
      {
        id: 'rule-account',
        key: 'account',
        regexString: '^account:(primary|secondary)$',
        suggestions: ['account:primary', 'account:secondary'],
      },
      {
        id: 'rule-transactions',
        key: 'transactions',
        regexString: '^transactions:(pending|completed):(\\d+)$',
        suggestions: ['transactions:pending:', 'transactions:completed:'],
      },
      {
        id: 'rule-balance',
        key: 'balance',
        regexString: '^balance:(high|low)$',
        suggestions: ['balance:high', 'balance:low'],
      },
      {
        id: 'rule-user',
        key: 'user',
        regexString: '^user:(primary|authorized|verified|mfa)$',
        suggestions: [
          'user:primary',
          'user:authorized',
          'user:verified',
          'user:mfa',
        ],
      },
    ],
  },
  TestDataFlavorsCARD: {
    lob: 'CARD',
    type: 'flavor',
    items: [
      {
        id: 'rule-card',
        key: 'card',
        regexString: '^card:(active|expired|inactive|new)$',
        suggestions: [
          'card:active',
          'card:expired',
          'card:inactive',
          'card:new',
        ],
      },
    ],
  },
  TestDataReconBANK: {
    lob: 'BANK',
    type: 'recon',
    items: [
      {
        id: 'rule-schedule',
        key: 'schedule',
        regexString: '^schedule:(month|days|year):(\\d+)$',
        suggestions: ['schedule:month:', 'schedule:days:', 'schedule:year:'],
      },
    ],
  },
};

export const mockRecipeGroups: Record<string, TdmRecipeConfig[]> = {
  TDMRecipesBANK: [
    {
      id: 'recipe-primary-checking',
      lob: 'BANK',
      name: 'Primary Checking Account',
      description: 'Standard primary user with an active checking account',
      tags: [
        'customer-type:primary-user',
        'account-type:checking',
        'account:primary',
        'user:primary',
      ],
    },
    {
      id: 'recipe-authorized-savings',
      lob: 'BANK',
      name: 'Authorized Savings User',
      description: 'Authorized user with a savings account and MFA',
      tags: [
        'customer-type:authorized-user',
        'account-type:savings',
        'user:authorized',
        'user:mfa',
      ],
    },
    {
      id: 'recipe-low-balance',
      lob: 'BANK',
      name: 'Low Balance Account',
      description: 'Primary user with low balance checking for NSF testing',
      tags: [
        'customer-type:primary-user',
        'account-type:checking',
        'balance:low',
        'account:primary',
      ],
    },
    {
      id: 'recipe-business-loc',
      lob: 'BANK',
      name: 'Business Line of Credit',
      description: 'Company with a line of credit and pending transactions',
      tags: [
        'customer-type:company',
        'account-type:line-of-credit',
        'balance:high',
      ],
    },
    {
      id: 'recipe-mfa-verified',
      lob: 'BANK',
      name: 'MFA Verified Customer',
      description: 'Verified retail customer with MFA enabled',
      tags: [
        'customer-type:retail',
        'user:verified',
        'user:mfa',
        'account:primary',
      ],
    },
  ],
  TDMRecipesCARD: [
    {
      id: 'recipe-business-credit',
      lob: 'CARD',
      name: 'Business Credit Card',
      description: 'Company entity with an active credit card and high balance',
      tags: [
        'customer-type:company',
        'account-type:credit-card',
        'card:active',
        'balance:high',
      ],
    },
    {
      id: 'recipe-retail-debit',
      lob: 'CARD',
      name: 'Retail Debit Card',
      description: 'Retail customer with a debit card',
      tags: [
        'customer-type:retail',
        'account-type:debit-card',
        'card:active',
        'user:verified',
      ],
    },
    {
      id: 'recipe-expired-card',
      lob: 'CARD',
      name: 'Expired Card Scenario',
      description:
        'Primary user with an expired credit card for renewal testing',
      tags: [
        'customer-type:primary-user',
        'account-type:credit-card',
        'card:expired',
        'account:primary',
      ],
    },
  ],
};
