[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [di/container](../README.md) / DIContainer

# Class: DIContainer

Defined in: [di/container.ts:33](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/di/container.ts#L33)

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

Defined in: [di/container.ts:34](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/di/container.ts#L34)

## Methods

### clear()

> **clear**(): `void`

Defined in: [di/container.ts:116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/di/container.ts#L116)

Clear all registered services and cached instances
Cyclomatic complexity: 1

Useful for testing and cleanup

#### Returns

`void`

***

### has()

> **has**(`token`): `boolean`

Defined in: [di/container.ts:106](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/di/container.ts#L106)

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

Defined in: [di/container.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/di/container.ts#L54)

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

Defined in: [di/container.ts:76](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/di/container.ts#L76)

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
