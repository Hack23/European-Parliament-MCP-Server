[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [di/container](../README.md) / DIContainer

# Class: DIContainer

Defined in: [di/container.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/di/container.ts#L44)

Dependency Injection Container
Cyclomatic complexity: 5

## Constructors

### Constructor

> **new DIContainer**(): `DIContainer`

#### Returns

`DIContainer`

## Properties

### services

> `private` `readonly` **services**: [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`symbol`, `ServiceDescriptor`\<`unknown`\>\>

Defined in: [di/container.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/di/container.ts#L45)

## Methods

### clear()

> **clear**(): `void`

Defined in: [di/container.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/di/container.ts#L127)

Clear all registered services and cached instances
Cyclomatic complexity: 1

Useful for testing and cleanup

#### Returns

`void`

***

### has()

> **has**(`token`): `boolean`

Defined in: [di/container.ts:117](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/di/container.ts#L117)

Check if a service is registered
Cyclomatic complexity: 1

#### Parameters

##### token

`symbol`

Service identifier token

#### Returns

`boolean`

True if service is registered

***

### register()

> **register**\<`T`\>(`token`, `factory`, `lifetime?`): `void`

Defined in: [di/container.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/di/container.ts#L65)

Register a service with the container
Cyclomatic complexity: 1

#### Type Parameters

##### T

`T`

#### Parameters

##### token

`symbol`

Service identifier token

##### factory

`ServiceFactory`\<`T`\>

Factory function to create service instances

##### lifetime?

`ServiceLifetime` = `'singleton'`

Service lifetime ('singleton' or 'transient')

#### Returns

`void`

#### Example

```typescript
const ReportServiceToken = Symbol('ReportService');
container.register(
  ReportServiceToken,
  (c) => new ReportService(c.resolve(EPClientToken)),
  'singleton'
);
```

***

### resolve()

> **resolve**\<`T`\>(`token`): `T`

Defined in: [di/container.ts:87](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/di/container.ts#L87)

Resolve a service from the container
Cyclomatic complexity: 4

#### Type Parameters

##### T

`T`

#### Parameters

##### token

`symbol`

Service identifier token

#### Returns

`T`

Resolved service instance

#### Throws

Error if service is not registered

#### Example

```typescript
const reportService = container.resolve(ReportServiceToken);
```
