[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [di/container](../README.md) / DIContainer

# Class: DIContainer

Defined in: [di/container.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/di/container.ts#L44)

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

Defined in: [di/container.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/di/container.ts#L45)

## Methods

### clear()

> **clear**(): `void`

Defined in: [di/container.ts:141](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/di/container.ts#L141)

Clear all registered services and cached instances.

Useful for testing and cleanup between test suites.

#### Returns

`void`

#### Example

```typescript
afterEach(() => {
  container.clear();
});
```

#### Since

0.8.0

***

### has()

> **has**(`token`): `boolean`

Defined in: [di/container.ts:123](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/di/container.ts#L123)

Check if a service is registered
Cyclomatic complexity: 1

#### Parameters

##### token

`symbol`

Service identifier token

#### Returns

`boolean`

`true` if the token is registered, `false` otherwise

#### Since

0.8.0

***

### register()

> **register**\<`T`\>(`token`, `factory`, `lifetime?`): `void`

Defined in: [di/container.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/di/container.ts#L67)

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

#### Since

0.8.0

***

### resolve()

> **resolve**\<`T`\>(`token`): `T`

Defined in: [di/container.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/di/container.ts#L91)

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

If service is not registered

#### Example

```typescript
const reportService = container.resolve(ReportServiceToken);
```

#### Since

0.8.0
