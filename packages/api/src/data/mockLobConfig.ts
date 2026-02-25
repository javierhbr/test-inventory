import type { LobConfigurationSections } from '../types/domain';

export const mockLobConfigurations: LobConfigurationSections = {
  CARD: {
    runtimes: {
      id: 'runtimes-card',
      title: 'Runtimes',
      description: 'Available execution platforms for CARD',
      type: 'keyvalue',
      items: {
        'OCP Testing Studio': 'Oracle Cloud Platform testing environment',
        Postman: 'API development and testing tool',
        Newman: 'Command line collection runner for Postman',
      },
    },
    s3config: {
      id: 's3config-card',
      title: 'S3 Configuration',
      description: 'Storage configuration for CARD',
      type: 'keyvalue',
      items: {
        Bucket: 'card-test-dialogs',
        ARN: 'arn:aws:s3:::card-test-dialogs',
        'Public URL': 'https://card-test-dialogs.s3.us-east-1.amazonaws.com',
        Versioning: 'Enabled',
        Region: 'us-east-1',
        Encryption: 'AES-256',
      },
    },
    githubRepos: {
      id: 'github-repos-card',
      title: 'GitHub Repos',
      description: 'Source code repositories for CARD',
      type: 'keyvalue',
      items: {
        'Tests Code': 'https://github.com/org/card-tests',
        'IVR Code': 'https://github.com/org/card-ivr',
      },
    },
  },
  BANK: {
    runtimes: {
      id: 'runtimes-bank',
      title: 'Runtimes',
      description: 'Available execution platforms for BANK',
      type: 'keyvalue',
      items: {
        Xero: 'Accounting software integration platform',
        Sierra: 'Library management system runtime',
        Postman: 'API development and testing tool',
      },
    },
    s3config: {
      id: 's3config-bank',
      title: 'S3 Configuration',
      description: 'Storage configuration for BANK',
      type: 'keyvalue',
      items: {
        Bucket: 'bank-test-dialogs',
        ARN: 'arn:aws:s3:::bank-test-dialogs',
        'Public URL': 'https://bank-test-dialogs.s3.us-west-2.amazonaws.com',
        Versioning: 'Enabled',
        Region: 'us-west-2',
        Encryption: 'AES-256',
      },
    },
    githubRepos: {
      id: 'github-repos-bank',
      title: 'GitHub Repos',
      description: 'Source code repositories for BANK',
      type: 'keyvalue',
      items: {
        'Tests Code': 'https://github.com/org/bank-tests',
        'IVR Code': 'https://github.com/org/bank-ivr',
      },
    },
  },
  FS: {
    runtimes: {
      id: 'runtimes-fs',
      title: 'Runtimes',
      description: 'Available execution platforms for FS',
      type: 'keyvalue',
      items: {
        'OCP Testing Studio': 'Oracle Cloud Platform testing environment',
        'Custom Runtime': 'User-defined execution environment',
        Newman: 'Command line collection runner for Postman',
      },
    },
    s3config: {
      id: 's3config-fs',
      title: 'S3 Configuration',
      description: 'Storage configuration for FS',
      type: 'keyvalue',
      items: {
        Bucket: 'fs-test-dialogs',
        ARN: 'arn:aws:s3:::fs-test-dialogs',
        'Public URL': 'https://fs-test-dialogs.s3.eu-west-1.amazonaws.com',
        Versioning: 'Enabled',
        Region: 'eu-west-1',
        Encryption: 'AES-256',
      },
    },
    githubRepos: {
      id: 'github-repos-fs',
      title: 'GitHub Repos',
      description: 'Source code repositories for FS',
      type: 'keyvalue',
      items: {
        'Tests Code': 'https://github.com/org/fs-tests',
        'IVR Code': 'https://github.com/org/fs-ivr',
      },
    },
  },
  DFS: {
    runtimes: {
      id: 'runtimes-dfs',
      title: 'Runtimes',
      description: 'Available execution platforms for DFS',
      type: 'keyvalue',
      items: {
        Sierra: 'Library management system runtime',
        Postman: 'API development and testing tool',
        'Custom Runtime': 'User-defined execution environment',
      },
    },
    s3config: {
      id: 's3config-dfs',
      title: 'S3 Configuration',
      description: 'Storage configuration for DFS',
      type: 'keyvalue',
      items: {
        Bucket: 'dfs-test-dialogs',
        ARN: 'arn:aws:s3:::dfs-test-dialogs',
        'Public URL': 'https://dfs-test-dialogs.s3.us-east-1.amazonaws.com',
        Versioning: 'Disabled',
        Region: 'us-east-1',
        Encryption: 'AES-256',
      },
    },
    githubRepos: {
      id: 'github-repos-dfs',
      title: 'GitHub Repos',
      description: 'Source code repositories for DFS',
      type: 'keyvalue',
      items: {
        'Tests Code': 'https://github.com/org/dfs-tests',
        'IVR Code': 'https://github.com/org/dfs-ivr',
      },
    },
  },
};
