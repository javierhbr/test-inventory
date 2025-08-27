# Configuration System

This directory contains JSON configuration files that make the application highly customizable without code changes.

## Configuration Files

### `/config/app.json`

Main application configuration including:

- Application metadata (name, description, version)
- Tab definitions with permissions
- Settings tab configuration

**Key Features:**

- **Tab Permissions**: Control which user profiles can access specific tabs
- **Dynamic Icons**: Configure icons for each tab using Lucide React icon names
- **Component Mapping**: Map tab IDs to React components

### `/config/system.json`

System configuration and settings page content:

- System configuration sections (Classifications, Runtimes, S3)
- Role and permission definitions
- Configurable content lists

**Key Features:**

- **Dynamic Sections**: Add/remove configuration sections
- **Content Types**: Support for list and key-value content types
- **Role Permissions**: Define what each user role can access

### `/config/users.json`

User management configuration:

- User profile definitions with icons and badges
- UI text and labels
- Validation messages
- Dialog configurations

**Key Features:**

- **Profile Badges**: Configure colors and icons for user roles
- **Internationalization**: All UI text configurable
- **Message Interpolation**: Dynamic messages with variable substitution

## Configuration Service

The `configService` provides:

- **Async Loading**: Configurations loaded on demand
- **Caching**: Configurations cached after first load
- **Helper Methods**: Utilities for permission checking, message interpolation
- **Type Safety**: Full TypeScript interfaces for all configurations

## Usage Examples

### Adding a New Tab

```json
{
  "id": "reports",
  "label": "Reports",
  "icon": "BarChart",
  "component": "ReportsComponent",
  "permissions": ["admin", "automation"],
  "description": "View system reports and analytics"
}
```

### Adding a Classification

```json
{
  "id": "classifications",
  "title": "Classifications",
  "description": "Manage classification catalog",
  "type": "list",
  "items": ["Active account", "Business account", "New classification here"]
}
```

### Customizing User Messages

```json
{
  "messages": {
    "userCreated": "User {username} created successfully",
    "customMessage": "Welcome {username} to {platform}!"
  }
}
```

## Benefits

1. **No Code Changes**: Modify behavior through JSON
2. **Multi-language Support**: Easy to add translations
3. **Role-based Access**: Granular permission control
4. **Consistent UI**: Centralized text and styling
5. **Easy Maintenance**: Non-technical users can update content

## File Structure

```
/config/
├── app.json          # Main application configuration
├── system.json       # System settings and content
├── users.json        # User management configuration
└── README.md         # This documentation
```

## Configuration Loading

Configurations are loaded asynchronously on application startup and cached for performance. If a configuration fails to load, the application will show appropriate error messages.

## TypeScript Support

All configurations have corresponding TypeScript interfaces in `/services/configService.ts` providing full type safety and IntelliSense support.
