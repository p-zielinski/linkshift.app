
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Organization
 * 
 */
export type Organization = $Result.DefaultSelection<Prisma.$OrganizationPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model OrganizationInvite
 * 
 */
export type OrganizationInvite = $Result.DefaultSelection<Prisma.$OrganizationInvitePayload>
/**
 * Model DomainGroup
 * 
 */
export type DomainGroup = $Result.DefaultSelection<Prisma.$DomainGroupPayload>
/**
 * Model Domain
 * 
 */
export type Domain = $Result.DefaultSelection<Prisma.$DomainPayload>
/**
 * Model RedirectRule
 * 
 */
export type RedirectRule = $Result.DefaultSelection<Prisma.$RedirectRulePayload>
/**
 * Model LinkMap
 * 
 */
export type LinkMap = $Result.DefaultSelection<Prisma.$LinkMapPayload>
/**
 * Model LinkMapEntry
 * 
 */
export type LinkMapEntry = $Result.DefaultSelection<Prisma.$LinkMapEntryPayload>
/**
 * Model RedirectRuleHitsHourly
 * 
 */
export type RedirectRuleHitsHourly = $Result.DefaultSelection<Prisma.$RedirectRuleHitsHourlyPayload>
/**
 * Model RedirectTest
 * 
 */
export type RedirectTest = $Result.DefaultSelection<Prisma.$RedirectTestPayload>
/**
 * Model BillingCheckoutSession
 * 
 */
export type BillingCheckoutSession = $Result.DefaultSelection<Prisma.$BillingCheckoutSessionPayload>
/**
 * Model CustomPlan
 * 
 */
export type CustomPlan = $Result.DefaultSelection<Prisma.$CustomPlanPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const HttpMethod: {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD'
};

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod]


export const RedirectQueryMatch: {
  exact: 'exact',
  ignore: 'ignore',
  subset: 'subset'
};

export type RedirectQueryMatch = (typeof RedirectQueryMatch)[keyof typeof RedirectQueryMatch]


export const RedirectPathMatch: {
  exact: 'exact',
  prefix: 'prefix'
};

export type RedirectPathMatch = (typeof RedirectPathMatch)[keyof typeof RedirectPathMatch]


export const BillingCheckoutStatus: {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELED: 'CANCELED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED'
};

export type BillingCheckoutStatus = (typeof BillingCheckoutStatus)[keyof typeof BillingCheckoutStatus]

}

export type HttpMethod = $Enums.HttpMethod

export const HttpMethod: typeof $Enums.HttpMethod

export type RedirectQueryMatch = $Enums.RedirectQueryMatch

export const RedirectQueryMatch: typeof $Enums.RedirectQueryMatch

export type RedirectPathMatch = $Enums.RedirectPathMatch

export const RedirectPathMatch: typeof $Enums.RedirectPathMatch

export type BillingCheckoutStatus = $Enums.BillingCheckoutStatus

export const BillingCheckoutStatus: typeof $Enums.BillingCheckoutStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Organizations
 * const organizations = await prisma.organization.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Organizations
   * const organizations = await prisma.organization.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.organization`: Exposes CRUD operations for the **Organization** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Organizations
    * const organizations = await prisma.organization.findMany()
    * ```
    */
  get organization(): Prisma.OrganizationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.organizationInvite`: Exposes CRUD operations for the **OrganizationInvite** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrganizationInvites
    * const organizationInvites = await prisma.organizationInvite.findMany()
    * ```
    */
  get organizationInvite(): Prisma.OrganizationInviteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.domainGroup`: Exposes CRUD operations for the **DomainGroup** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DomainGroups
    * const domainGroups = await prisma.domainGroup.findMany()
    * ```
    */
  get domainGroup(): Prisma.DomainGroupDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.domain`: Exposes CRUD operations for the **Domain** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Domains
    * const domains = await prisma.domain.findMany()
    * ```
    */
  get domain(): Prisma.DomainDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.redirectRule`: Exposes CRUD operations for the **RedirectRule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RedirectRules
    * const redirectRules = await prisma.redirectRule.findMany()
    * ```
    */
  get redirectRule(): Prisma.RedirectRuleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.linkMap`: Exposes CRUD operations for the **LinkMap** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LinkMaps
    * const linkMaps = await prisma.linkMap.findMany()
    * ```
    */
  get linkMap(): Prisma.LinkMapDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.linkMapEntry`: Exposes CRUD operations for the **LinkMapEntry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LinkMapEntries
    * const linkMapEntries = await prisma.linkMapEntry.findMany()
    * ```
    */
  get linkMapEntry(): Prisma.LinkMapEntryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.redirectRuleHitsHourly`: Exposes CRUD operations for the **RedirectRuleHitsHourly** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RedirectRuleHitsHourlies
    * const redirectRuleHitsHourlies = await prisma.redirectRuleHitsHourly.findMany()
    * ```
    */
  get redirectRuleHitsHourly(): Prisma.RedirectRuleHitsHourlyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.redirectTest`: Exposes CRUD operations for the **RedirectTest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RedirectTests
    * const redirectTests = await prisma.redirectTest.findMany()
    * ```
    */
  get redirectTest(): Prisma.RedirectTestDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.billingCheckoutSession`: Exposes CRUD operations for the **BillingCheckoutSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BillingCheckoutSessions
    * const billingCheckoutSessions = await prisma.billingCheckoutSession.findMany()
    * ```
    */
  get billingCheckoutSession(): Prisma.BillingCheckoutSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.customPlan`: Exposes CRUD operations for the **CustomPlan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CustomPlans
    * const customPlans = await prisma.customPlan.findMany()
    * ```
    */
  get customPlan(): Prisma.CustomPlanDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.0-dev.7
   * Query Engine version: a09903a14c97c90b4fa191ca42b02ec9a7809451
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Organization: 'Organization',
    User: 'User',
    OrganizationInvite: 'OrganizationInvite',
    DomainGroup: 'DomainGroup',
    Domain: 'Domain',
    RedirectRule: 'RedirectRule',
    LinkMap: 'LinkMap',
    LinkMapEntry: 'LinkMapEntry',
    RedirectRuleHitsHourly: 'RedirectRuleHitsHourly',
    RedirectTest: 'RedirectTest',
    BillingCheckoutSession: 'BillingCheckoutSession',
    CustomPlan: 'CustomPlan'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "organization" | "user" | "organizationInvite" | "domainGroup" | "domain" | "redirectRule" | "linkMap" | "linkMapEntry" | "redirectRuleHitsHourly" | "redirectTest" | "billingCheckoutSession" | "customPlan"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Organization: {
        payload: Prisma.$OrganizationPayload<ExtArgs>
        fields: Prisma.OrganizationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findFirst: {
            args: Prisma.OrganizationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findMany: {
            args: Prisma.OrganizationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          create: {
            args: Prisma.OrganizationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          createMany: {
            args: Prisma.OrganizationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganizationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          delete: {
            args: Prisma.OrganizationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          update: {
            args: Prisma.OrganizationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          deleteMany: {
            args: Prisma.OrganizationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganizationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          upsert: {
            args: Prisma.OrganizationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          aggregate: {
            args: Prisma.OrganizationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganization>
          }
          groupBy: {
            args: Prisma.OrganizationGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      OrganizationInvite: {
        payload: Prisma.$OrganizationInvitePayload<ExtArgs>
        fields: Prisma.OrganizationInviteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationInviteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationInviteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload>
          }
          findFirst: {
            args: Prisma.OrganizationInviteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationInviteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload>
          }
          findMany: {
            args: Prisma.OrganizationInviteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload>[]
          }
          create: {
            args: Prisma.OrganizationInviteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload>
          }
          createMany: {
            args: Prisma.OrganizationInviteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganizationInviteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload>[]
          }
          delete: {
            args: Prisma.OrganizationInviteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload>
          }
          update: {
            args: Prisma.OrganizationInviteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload>
          }
          deleteMany: {
            args: Prisma.OrganizationInviteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationInviteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganizationInviteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload>[]
          }
          upsert: {
            args: Prisma.OrganizationInviteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationInvitePayload>
          }
          aggregate: {
            args: Prisma.OrganizationInviteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganizationInvite>
          }
          groupBy: {
            args: Prisma.OrganizationInviteGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationInviteGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationInviteCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationInviteCountAggregateOutputType> | number
          }
        }
      }
      DomainGroup: {
        payload: Prisma.$DomainGroupPayload<ExtArgs>
        fields: Prisma.DomainGroupFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DomainGroupFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DomainGroupFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload>
          }
          findFirst: {
            args: Prisma.DomainGroupFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DomainGroupFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload>
          }
          findMany: {
            args: Prisma.DomainGroupFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload>[]
          }
          create: {
            args: Prisma.DomainGroupCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload>
          }
          createMany: {
            args: Prisma.DomainGroupCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DomainGroupCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload>[]
          }
          delete: {
            args: Prisma.DomainGroupDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload>
          }
          update: {
            args: Prisma.DomainGroupUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload>
          }
          deleteMany: {
            args: Prisma.DomainGroupDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DomainGroupUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DomainGroupUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload>[]
          }
          upsert: {
            args: Prisma.DomainGroupUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainGroupPayload>
          }
          aggregate: {
            args: Prisma.DomainGroupAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDomainGroup>
          }
          groupBy: {
            args: Prisma.DomainGroupGroupByArgs<ExtArgs>
            result: $Utils.Optional<DomainGroupGroupByOutputType>[]
          }
          count: {
            args: Prisma.DomainGroupCountArgs<ExtArgs>
            result: $Utils.Optional<DomainGroupCountAggregateOutputType> | number
          }
        }
      }
      Domain: {
        payload: Prisma.$DomainPayload<ExtArgs>
        fields: Prisma.DomainFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DomainFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DomainFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload>
          }
          findFirst: {
            args: Prisma.DomainFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DomainFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload>
          }
          findMany: {
            args: Prisma.DomainFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload>[]
          }
          create: {
            args: Prisma.DomainCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload>
          }
          createMany: {
            args: Prisma.DomainCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DomainCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload>[]
          }
          delete: {
            args: Prisma.DomainDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload>
          }
          update: {
            args: Prisma.DomainUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload>
          }
          deleteMany: {
            args: Prisma.DomainDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DomainUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DomainUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload>[]
          }
          upsert: {
            args: Prisma.DomainUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DomainPayload>
          }
          aggregate: {
            args: Prisma.DomainAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDomain>
          }
          groupBy: {
            args: Prisma.DomainGroupByArgs<ExtArgs>
            result: $Utils.Optional<DomainGroupByOutputType>[]
          }
          count: {
            args: Prisma.DomainCountArgs<ExtArgs>
            result: $Utils.Optional<DomainCountAggregateOutputType> | number
          }
        }
      }
      RedirectRule: {
        payload: Prisma.$RedirectRulePayload<ExtArgs>
        fields: Prisma.RedirectRuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RedirectRuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RedirectRuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload>
          }
          findFirst: {
            args: Prisma.RedirectRuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RedirectRuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload>
          }
          findMany: {
            args: Prisma.RedirectRuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload>[]
          }
          create: {
            args: Prisma.RedirectRuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload>
          }
          createMany: {
            args: Prisma.RedirectRuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RedirectRuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload>[]
          }
          delete: {
            args: Prisma.RedirectRuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload>
          }
          update: {
            args: Prisma.RedirectRuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload>
          }
          deleteMany: {
            args: Prisma.RedirectRuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RedirectRuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RedirectRuleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload>[]
          }
          upsert: {
            args: Prisma.RedirectRuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRulePayload>
          }
          aggregate: {
            args: Prisma.RedirectRuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRedirectRule>
          }
          groupBy: {
            args: Prisma.RedirectRuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<RedirectRuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.RedirectRuleCountArgs<ExtArgs>
            result: $Utils.Optional<RedirectRuleCountAggregateOutputType> | number
          }
        }
      }
      LinkMap: {
        payload: Prisma.$LinkMapPayload<ExtArgs>
        fields: Prisma.LinkMapFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LinkMapFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LinkMapFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload>
          }
          findFirst: {
            args: Prisma.LinkMapFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LinkMapFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload>
          }
          findMany: {
            args: Prisma.LinkMapFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload>[]
          }
          create: {
            args: Prisma.LinkMapCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload>
          }
          createMany: {
            args: Prisma.LinkMapCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LinkMapCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload>[]
          }
          delete: {
            args: Prisma.LinkMapDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload>
          }
          update: {
            args: Prisma.LinkMapUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload>
          }
          deleteMany: {
            args: Prisma.LinkMapDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LinkMapUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LinkMapUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload>[]
          }
          upsert: {
            args: Prisma.LinkMapUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapPayload>
          }
          aggregate: {
            args: Prisma.LinkMapAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLinkMap>
          }
          groupBy: {
            args: Prisma.LinkMapGroupByArgs<ExtArgs>
            result: $Utils.Optional<LinkMapGroupByOutputType>[]
          }
          count: {
            args: Prisma.LinkMapCountArgs<ExtArgs>
            result: $Utils.Optional<LinkMapCountAggregateOutputType> | number
          }
        }
      }
      LinkMapEntry: {
        payload: Prisma.$LinkMapEntryPayload<ExtArgs>
        fields: Prisma.LinkMapEntryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LinkMapEntryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LinkMapEntryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload>
          }
          findFirst: {
            args: Prisma.LinkMapEntryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LinkMapEntryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload>
          }
          findMany: {
            args: Prisma.LinkMapEntryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload>[]
          }
          create: {
            args: Prisma.LinkMapEntryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload>
          }
          createMany: {
            args: Prisma.LinkMapEntryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LinkMapEntryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload>[]
          }
          delete: {
            args: Prisma.LinkMapEntryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload>
          }
          update: {
            args: Prisma.LinkMapEntryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload>
          }
          deleteMany: {
            args: Prisma.LinkMapEntryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LinkMapEntryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LinkMapEntryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload>[]
          }
          upsert: {
            args: Prisma.LinkMapEntryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkMapEntryPayload>
          }
          aggregate: {
            args: Prisma.LinkMapEntryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLinkMapEntry>
          }
          groupBy: {
            args: Prisma.LinkMapEntryGroupByArgs<ExtArgs>
            result: $Utils.Optional<LinkMapEntryGroupByOutputType>[]
          }
          count: {
            args: Prisma.LinkMapEntryCountArgs<ExtArgs>
            result: $Utils.Optional<LinkMapEntryCountAggregateOutputType> | number
          }
        }
      }
      RedirectRuleHitsHourly: {
        payload: Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>
        fields: Prisma.RedirectRuleHitsHourlyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RedirectRuleHitsHourlyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RedirectRuleHitsHourlyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload>
          }
          findFirst: {
            args: Prisma.RedirectRuleHitsHourlyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RedirectRuleHitsHourlyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload>
          }
          findMany: {
            args: Prisma.RedirectRuleHitsHourlyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload>[]
          }
          create: {
            args: Prisma.RedirectRuleHitsHourlyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload>
          }
          createMany: {
            args: Prisma.RedirectRuleHitsHourlyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RedirectRuleHitsHourlyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload>[]
          }
          delete: {
            args: Prisma.RedirectRuleHitsHourlyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload>
          }
          update: {
            args: Prisma.RedirectRuleHitsHourlyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload>
          }
          deleteMany: {
            args: Prisma.RedirectRuleHitsHourlyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RedirectRuleHitsHourlyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RedirectRuleHitsHourlyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload>[]
          }
          upsert: {
            args: Prisma.RedirectRuleHitsHourlyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectRuleHitsHourlyPayload>
          }
          aggregate: {
            args: Prisma.RedirectRuleHitsHourlyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRedirectRuleHitsHourly>
          }
          groupBy: {
            args: Prisma.RedirectRuleHitsHourlyGroupByArgs<ExtArgs>
            result: $Utils.Optional<RedirectRuleHitsHourlyGroupByOutputType>[]
          }
          count: {
            args: Prisma.RedirectRuleHitsHourlyCountArgs<ExtArgs>
            result: $Utils.Optional<RedirectRuleHitsHourlyCountAggregateOutputType> | number
          }
        }
      }
      RedirectTest: {
        payload: Prisma.$RedirectTestPayload<ExtArgs>
        fields: Prisma.RedirectTestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RedirectTestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RedirectTestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload>
          }
          findFirst: {
            args: Prisma.RedirectTestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RedirectTestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload>
          }
          findMany: {
            args: Prisma.RedirectTestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload>[]
          }
          create: {
            args: Prisma.RedirectTestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload>
          }
          createMany: {
            args: Prisma.RedirectTestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RedirectTestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload>[]
          }
          delete: {
            args: Prisma.RedirectTestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload>
          }
          update: {
            args: Prisma.RedirectTestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload>
          }
          deleteMany: {
            args: Prisma.RedirectTestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RedirectTestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RedirectTestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload>[]
          }
          upsert: {
            args: Prisma.RedirectTestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectTestPayload>
          }
          aggregate: {
            args: Prisma.RedirectTestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRedirectTest>
          }
          groupBy: {
            args: Prisma.RedirectTestGroupByArgs<ExtArgs>
            result: $Utils.Optional<RedirectTestGroupByOutputType>[]
          }
          count: {
            args: Prisma.RedirectTestCountArgs<ExtArgs>
            result: $Utils.Optional<RedirectTestCountAggregateOutputType> | number
          }
        }
      }
      BillingCheckoutSession: {
        payload: Prisma.$BillingCheckoutSessionPayload<ExtArgs>
        fields: Prisma.BillingCheckoutSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BillingCheckoutSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BillingCheckoutSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload>
          }
          findFirst: {
            args: Prisma.BillingCheckoutSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BillingCheckoutSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload>
          }
          findMany: {
            args: Prisma.BillingCheckoutSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload>[]
          }
          create: {
            args: Prisma.BillingCheckoutSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload>
          }
          createMany: {
            args: Prisma.BillingCheckoutSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BillingCheckoutSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload>[]
          }
          delete: {
            args: Prisma.BillingCheckoutSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload>
          }
          update: {
            args: Prisma.BillingCheckoutSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload>
          }
          deleteMany: {
            args: Prisma.BillingCheckoutSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BillingCheckoutSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BillingCheckoutSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload>[]
          }
          upsert: {
            args: Prisma.BillingCheckoutSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillingCheckoutSessionPayload>
          }
          aggregate: {
            args: Prisma.BillingCheckoutSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBillingCheckoutSession>
          }
          groupBy: {
            args: Prisma.BillingCheckoutSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<BillingCheckoutSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.BillingCheckoutSessionCountArgs<ExtArgs>
            result: $Utils.Optional<BillingCheckoutSessionCountAggregateOutputType> | number
          }
        }
      }
      CustomPlan: {
        payload: Prisma.$CustomPlanPayload<ExtArgs>
        fields: Prisma.CustomPlanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomPlanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomPlanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload>
          }
          findFirst: {
            args: Prisma.CustomPlanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomPlanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload>
          }
          findMany: {
            args: Prisma.CustomPlanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload>[]
          }
          create: {
            args: Prisma.CustomPlanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload>
          }
          createMany: {
            args: Prisma.CustomPlanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomPlanCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload>[]
          }
          delete: {
            args: Prisma.CustomPlanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload>
          }
          update: {
            args: Prisma.CustomPlanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload>
          }
          deleteMany: {
            args: Prisma.CustomPlanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomPlanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustomPlanUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload>[]
          }
          upsert: {
            args: Prisma.CustomPlanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomPlanPayload>
          }
          aggregate: {
            args: Prisma.CustomPlanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomPlan>
          }
          groupBy: {
            args: Prisma.CustomPlanGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomPlanGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomPlanCountArgs<ExtArgs>
            result: $Utils.Optional<CustomPlanCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    organization?: OrganizationOmit
    user?: UserOmit
    organizationInvite?: OrganizationInviteOmit
    domainGroup?: DomainGroupOmit
    domain?: DomainOmit
    redirectRule?: RedirectRuleOmit
    linkMap?: LinkMapOmit
    linkMapEntry?: LinkMapEntryOmit
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyOmit
    redirectTest?: RedirectTestOmit
    billingCheckoutSession?: BillingCheckoutSessionOmit
    customPlan?: CustomPlanOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type OrganizationCountOutputType
   */

  export type OrganizationCountOutputType = {
    users: number
    domainGroups: number
    checkoutSessions: number
    customPlans: number
    redirectTests: number
    invites: number
    redirectRuleHitsHourly: number
  }

  export type OrganizationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | OrganizationCountOutputTypeCountUsersArgs
    domainGroups?: boolean | OrganizationCountOutputTypeCountDomainGroupsArgs
    checkoutSessions?: boolean | OrganizationCountOutputTypeCountCheckoutSessionsArgs
    customPlans?: boolean | OrganizationCountOutputTypeCountCustomPlansArgs
    redirectTests?: boolean | OrganizationCountOutputTypeCountRedirectTestsArgs
    invites?: boolean | OrganizationCountOutputTypeCountInvitesArgs
    redirectRuleHitsHourly?: boolean | OrganizationCountOutputTypeCountRedirectRuleHitsHourlyArgs
  }

  // Custom InputTypes
  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationCountOutputType
     */
    select?: OrganizationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountDomainGroupsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DomainGroupWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountCheckoutSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BillingCheckoutSessionWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountCustomPlansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomPlanWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountRedirectTestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RedirectTestWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountInvitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationInviteWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountRedirectRuleHitsHourlyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RedirectRuleHitsHourlyWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    checkoutSessions: number
    createdInvites: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    checkoutSessions?: boolean | UserCountOutputTypeCountCheckoutSessionsArgs
    createdInvites?: boolean | UserCountOutputTypeCountCreatedInvitesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCheckoutSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BillingCheckoutSessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCreatedInvitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationInviteWhereInput
  }


  /**
   * Count Type DomainGroupCountOutputType
   */

  export type DomainGroupCountOutputType = {
    domains: number
    redirectRules: number
    linkMaps: number
    redirectTests: number
  }

  export type DomainGroupCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domains?: boolean | DomainGroupCountOutputTypeCountDomainsArgs
    redirectRules?: boolean | DomainGroupCountOutputTypeCountRedirectRulesArgs
    linkMaps?: boolean | DomainGroupCountOutputTypeCountLinkMapsArgs
    redirectTests?: boolean | DomainGroupCountOutputTypeCountRedirectTestsArgs
  }

  // Custom InputTypes
  /**
   * DomainGroupCountOutputType without action
   */
  export type DomainGroupCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroupCountOutputType
     */
    select?: DomainGroupCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DomainGroupCountOutputType without action
   */
  export type DomainGroupCountOutputTypeCountDomainsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DomainWhereInput
  }

  /**
   * DomainGroupCountOutputType without action
   */
  export type DomainGroupCountOutputTypeCountRedirectRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RedirectRuleWhereInput
  }

  /**
   * DomainGroupCountOutputType without action
   */
  export type DomainGroupCountOutputTypeCountLinkMapsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LinkMapWhereInput
  }

  /**
   * DomainGroupCountOutputType without action
   */
  export type DomainGroupCountOutputTypeCountRedirectTestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RedirectTestWhereInput
  }


  /**
   * Count Type RedirectRuleCountOutputType
   */

  export type RedirectRuleCountOutputType = {
    hitsHourly: number
  }

  export type RedirectRuleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    hitsHourly?: boolean | RedirectRuleCountOutputTypeCountHitsHourlyArgs
  }

  // Custom InputTypes
  /**
   * RedirectRuleCountOutputType without action
   */
  export type RedirectRuleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleCountOutputType
     */
    select?: RedirectRuleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RedirectRuleCountOutputType without action
   */
  export type RedirectRuleCountOutputTypeCountHitsHourlyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RedirectRuleHitsHourlyWhereInput
  }


  /**
   * Count Type LinkMapCountOutputType
   */

  export type LinkMapCountOutputType = {
    entries: number
    redirectRules: number
  }

  export type LinkMapCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    entries?: boolean | LinkMapCountOutputTypeCountEntriesArgs
    redirectRules?: boolean | LinkMapCountOutputTypeCountRedirectRulesArgs
  }

  // Custom InputTypes
  /**
   * LinkMapCountOutputType without action
   */
  export type LinkMapCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapCountOutputType
     */
    select?: LinkMapCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LinkMapCountOutputType without action
   */
  export type LinkMapCountOutputTypeCountEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LinkMapEntryWhereInput
  }

  /**
   * LinkMapCountOutputType without action
   */
  export type LinkMapCountOutputTypeCountRedirectRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RedirectRuleWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Organization
   */

  export type AggregateOrganization = {
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  export type OrganizationMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type OrganizationMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type OrganizationCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    configuration: number
    _all: number
  }


  export type OrganizationMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type OrganizationMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type OrganizationCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    configuration?: true
    _all?: true
  }

  export type OrganizationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organization to aggregate.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Organizations
    **/
    _count?: true | OrganizationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationMaxAggregateInputType
  }

  export type GetOrganizationAggregateType<T extends OrganizationAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganization]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganization[P]>
      : GetScalarType<T[P], AggregateOrganization[P]>
  }




  export type OrganizationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationWhereInput
    orderBy?: OrganizationOrderByWithAggregationInput | OrganizationOrderByWithAggregationInput[]
    by: OrganizationScalarFieldEnum[] | OrganizationScalarFieldEnum
    having?: OrganizationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationCountAggregateInputType | true
    _min?: OrganizationMinAggregateInputType
    _max?: OrganizationMaxAggregateInputType
  }

  export type OrganizationGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    configuration: JsonValue | null
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  type GetOrganizationGroupByPayload<T extends OrganizationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    configuration?: boolean
    users?: boolean | Organization$usersArgs<ExtArgs>
    domainGroups?: boolean | Organization$domainGroupsArgs<ExtArgs>
    checkoutSessions?: boolean | Organization$checkoutSessionsArgs<ExtArgs>
    customPlans?: boolean | Organization$customPlansArgs<ExtArgs>
    redirectTests?: boolean | Organization$redirectTestsArgs<ExtArgs>
    invites?: boolean | Organization$invitesArgs<ExtArgs>
    redirectRuleHitsHourly?: boolean | Organization$redirectRuleHitsHourlyArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    configuration?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    configuration?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    configuration?: boolean
  }

  export type OrganizationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt" | "updatedAt" | "deletedAt" | "configuration", ExtArgs["result"]["organization"]>
  export type OrganizationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Organization$usersArgs<ExtArgs>
    domainGroups?: boolean | Organization$domainGroupsArgs<ExtArgs>
    checkoutSessions?: boolean | Organization$checkoutSessionsArgs<ExtArgs>
    customPlans?: boolean | Organization$customPlansArgs<ExtArgs>
    redirectTests?: boolean | Organization$redirectTestsArgs<ExtArgs>
    invites?: boolean | Organization$invitesArgs<ExtArgs>
    redirectRuleHitsHourly?: boolean | Organization$redirectRuleHitsHourlyArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrganizationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OrganizationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OrganizationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Organization"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[]
      domainGroups: Prisma.$DomainGroupPayload<ExtArgs>[]
      checkoutSessions: Prisma.$BillingCheckoutSessionPayload<ExtArgs>[]
      customPlans: Prisma.$CustomPlanPayload<ExtArgs>[]
      redirectTests: Prisma.$RedirectTestPayload<ExtArgs>[]
      invites: Prisma.$OrganizationInvitePayload<ExtArgs>[]
      redirectRuleHitsHourly: Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
      configuration: Prisma.JsonValue | null
    }, ExtArgs["result"]["organization"]>
    composites: {}
  }

  type OrganizationGetPayload<S extends boolean | null | undefined | OrganizationDefaultArgs> = $Result.GetResult<Prisma.$OrganizationPayload, S>

  type OrganizationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationCountAggregateInputType | true
    }

  export interface OrganizationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Organization'], meta: { name: 'Organization' } }
    /**
     * Find zero or one Organization that matches the filter.
     * @param {OrganizationFindUniqueArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationFindUniqueArgs>(args: SelectSubset<T, OrganizationFindUniqueArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Organization that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationFindUniqueOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationFindFirstArgs>(args?: SelectSubset<T, OrganizationFindFirstArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Organizations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Organizations
     * const organizations = await prisma.organization.findMany()
     * 
     * // Get first 10 Organizations
     * const organizations = await prisma.organization.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationWithIdOnly = await prisma.organization.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganizationFindManyArgs>(args?: SelectSubset<T, OrganizationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Organization.
     * @param {OrganizationCreateArgs} args - Arguments to create a Organization.
     * @example
     * // Create one Organization
     * const Organization = await prisma.organization.create({
     *   data: {
     *     // ... data to create a Organization
     *   }
     * })
     * 
     */
    create<T extends OrganizationCreateArgs>(args: SelectSubset<T, OrganizationCreateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Organizations.
     * @param {OrganizationCreateManyArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganizationCreateManyArgs>(args?: SelectSubset<T, OrganizationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Organizations and returns the data saved in the database.
     * @param {OrganizationCreateManyAndReturnArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganizationCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganizationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Organization.
     * @param {OrganizationDeleteArgs} args - Arguments to delete one Organization.
     * @example
     * // Delete one Organization
     * const Organization = await prisma.organization.delete({
     *   where: {
     *     // ... filter to delete one Organization
     *   }
     * })
     * 
     */
    delete<T extends OrganizationDeleteArgs>(args: SelectSubset<T, OrganizationDeleteArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Organization.
     * @param {OrganizationUpdateArgs} args - Arguments to update one Organization.
     * @example
     * // Update one Organization
     * const organization = await prisma.organization.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganizationUpdateArgs>(args: SelectSubset<T, OrganizationUpdateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Organizations.
     * @param {OrganizationDeleteManyArgs} args - Arguments to filter Organizations to delete.
     * @example
     * // Delete a few Organizations
     * const { count } = await prisma.organization.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganizationDeleteManyArgs>(args?: SelectSubset<T, OrganizationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganizationUpdateManyArgs>(args: SelectSubset<T, OrganizationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations and returns the data updated in the database.
     * @param {OrganizationUpdateManyAndReturnArgs} args - Arguments to update many Organizations.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrganizationUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganizationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Organization.
     * @param {OrganizationUpsertArgs} args - Arguments to update or create a Organization.
     * @example
     * // Update or create a Organization
     * const organization = await prisma.organization.upsert({
     *   create: {
     *     // ... data to create a Organization
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Organization we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationUpsertArgs>(args: SelectSubset<T, OrganizationUpsertArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationCountArgs} args - Arguments to filter Organizations to count.
     * @example
     * // Count the number of Organizations
     * const count = await prisma.organization.count({
     *   where: {
     *     // ... the filter for the Organizations we want to count
     *   }
     * })
    **/
    count<T extends OrganizationCountArgs>(
      args?: Subset<T, OrganizationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrganizationAggregateArgs>(args: Subset<T, OrganizationAggregateArgs>): Prisma.PrismaPromise<GetOrganizationAggregateType<T>>

    /**
     * Group by Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrganizationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrganizationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Organization model
   */
  readonly fields: OrganizationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Organization.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Organization$usersArgs<ExtArgs> = {}>(args?: Subset<T, Organization$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    domainGroups<T extends Organization$domainGroupsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$domainGroupsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    checkoutSessions<T extends Organization$checkoutSessionsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$checkoutSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    customPlans<T extends Organization$customPlansArgs<ExtArgs> = {}>(args?: Subset<T, Organization$customPlansArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    redirectTests<T extends Organization$redirectTestsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$redirectTestsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    invites<T extends Organization$invitesArgs<ExtArgs> = {}>(args?: Subset<T, Organization$invitesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    redirectRuleHitsHourly<T extends Organization$redirectRuleHitsHourlyArgs<ExtArgs> = {}>(args?: Subset<T, Organization$redirectRuleHitsHourlyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Organization model
   */
  interface OrganizationFieldRefs {
    readonly id: FieldRef<"Organization", 'String'>
    readonly name: FieldRef<"Organization", 'String'>
    readonly createdAt: FieldRef<"Organization", 'DateTime'>
    readonly updatedAt: FieldRef<"Organization", 'DateTime'>
    readonly deletedAt: FieldRef<"Organization", 'DateTime'>
    readonly configuration: FieldRef<"Organization", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * Organization findUnique
   */
  export type OrganizationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findUniqueOrThrow
   */
  export type OrganizationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findFirst
   */
  export type OrganizationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findFirstOrThrow
   */
  export type OrganizationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findMany
   */
  export type OrganizationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organizations to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization create
   */
  export type OrganizationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to create a Organization.
     */
    data: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
  }

  /**
   * Organization createMany
   */
  export type OrganizationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization createManyAndReturn
   */
  export type OrganizationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization update
   */
  export type OrganizationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to update a Organization.
     */
    data: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
    /**
     * Choose, which Organization to update.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization updateMany
   */
  export type OrganizationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization updateManyAndReturn
   */
  export type OrganizationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization upsert
   */
  export type OrganizationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The filter to search for the Organization to update in case it exists.
     */
    where: OrganizationWhereUniqueInput
    /**
     * In case the Organization found by the `where` argument doesn't exist, create a new Organization with this data.
     */
    create: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
    /**
     * In case the Organization was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
  }

  /**
   * Organization delete
   */
  export type OrganizationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter which Organization to delete.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization deleteMany
   */
  export type OrganizationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organizations to delete
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to delete.
     */
    limit?: number
  }

  /**
   * Organization.users
   */
  export type Organization$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Organization.domainGroups
   */
  export type Organization$domainGroupsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
    where?: DomainGroupWhereInput
    orderBy?: DomainGroupOrderByWithRelationInput | DomainGroupOrderByWithRelationInput[]
    cursor?: DomainGroupWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DomainGroupScalarFieldEnum | DomainGroupScalarFieldEnum[]
  }

  /**
   * Organization.checkoutSessions
   */
  export type Organization$checkoutSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    where?: BillingCheckoutSessionWhereInput
    orderBy?: BillingCheckoutSessionOrderByWithRelationInput | BillingCheckoutSessionOrderByWithRelationInput[]
    cursor?: BillingCheckoutSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BillingCheckoutSessionScalarFieldEnum | BillingCheckoutSessionScalarFieldEnum[]
  }

  /**
   * Organization.customPlans
   */
  export type Organization$customPlansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
    where?: CustomPlanWhereInput
    orderBy?: CustomPlanOrderByWithRelationInput | CustomPlanOrderByWithRelationInput[]
    cursor?: CustomPlanWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomPlanScalarFieldEnum | CustomPlanScalarFieldEnum[]
  }

  /**
   * Organization.redirectTests
   */
  export type Organization$redirectTestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    where?: RedirectTestWhereInput
    orderBy?: RedirectTestOrderByWithRelationInput | RedirectTestOrderByWithRelationInput[]
    cursor?: RedirectTestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RedirectTestScalarFieldEnum | RedirectTestScalarFieldEnum[]
  }

  /**
   * Organization.invites
   */
  export type Organization$invitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    where?: OrganizationInviteWhereInput
    orderBy?: OrganizationInviteOrderByWithRelationInput | OrganizationInviteOrderByWithRelationInput[]
    cursor?: OrganizationInviteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrganizationInviteScalarFieldEnum | OrganizationInviteScalarFieldEnum[]
  }

  /**
   * Organization.redirectRuleHitsHourly
   */
  export type Organization$redirectRuleHitsHourlyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    where?: RedirectRuleHitsHourlyWhereInput
    orderBy?: RedirectRuleHitsHourlyOrderByWithRelationInput | RedirectRuleHitsHourlyOrderByWithRelationInput[]
    cursor?: RedirectRuleHitsHourlyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RedirectRuleHitsHourlyScalarFieldEnum | RedirectRuleHitsHourlyScalarFieldEnum[]
  }

  /**
   * Organization without action
   */
  export type OrganizationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    organizationId: string | null
    isOwner: boolean | null
    emailVerifiedAt: Date | null
    isBlocked: boolean | null
    blockedAt: Date | null
    termsAcceptedAt: Date | null
    privacyAcceptedAt: Date | null
    ageConfirmedAt: Date | null
    legalVersion: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    organizationId: string | null
    isOwner: boolean | null
    emailVerifiedAt: Date | null
    isBlocked: boolean | null
    blockedAt: Date | null
    termsAcceptedAt: Date | null
    privacyAcceptedAt: Date | null
    ageConfirmedAt: Date | null
    legalVersion: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    organizationId: number
    isOwner: number
    emailVerifiedAt: number
    isBlocked: number
    blockedAt: number
    termsAcceptedAt: number
    privacyAcceptedAt: number
    ageConfirmedAt: number
    legalVersion: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    organizationId?: true
    isOwner?: true
    emailVerifiedAt?: true
    isBlocked?: true
    blockedAt?: true
    termsAcceptedAt?: true
    privacyAcceptedAt?: true
    ageConfirmedAt?: true
    legalVersion?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    organizationId?: true
    isOwner?: true
    emailVerifiedAt?: true
    isBlocked?: true
    blockedAt?: true
    termsAcceptedAt?: true
    privacyAcceptedAt?: true
    ageConfirmedAt?: true
    legalVersion?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    organizationId?: true
    isOwner?: true
    emailVerifiedAt?: true
    isBlocked?: true
    blockedAt?: true
    termsAcceptedAt?: true
    privacyAcceptedAt?: true
    ageConfirmedAt?: true
    legalVersion?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    organizationId: string
    isOwner: boolean
    emailVerifiedAt: Date | null
    isBlocked: boolean
    blockedAt: Date | null
    termsAcceptedAt: Date | null
    privacyAcceptedAt: Date | null
    ageConfirmedAt: Date | null
    legalVersion: string | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    organizationId?: boolean
    isOwner?: boolean
    emailVerifiedAt?: boolean
    isBlocked?: boolean
    blockedAt?: boolean
    termsAcceptedAt?: boolean
    privacyAcceptedAt?: boolean
    ageConfirmedAt?: boolean
    legalVersion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    checkoutSessions?: boolean | User$checkoutSessionsArgs<ExtArgs>
    createdInvites?: boolean | User$createdInvitesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    organizationId?: boolean
    isOwner?: boolean
    emailVerifiedAt?: boolean
    isBlocked?: boolean
    blockedAt?: boolean
    termsAcceptedAt?: boolean
    privacyAcceptedAt?: boolean
    ageConfirmedAt?: boolean
    legalVersion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    organizationId?: boolean
    isOwner?: boolean
    emailVerifiedAt?: boolean
    isBlocked?: boolean
    blockedAt?: boolean
    termsAcceptedAt?: boolean
    privacyAcceptedAt?: boolean
    ageConfirmedAt?: boolean
    legalVersion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    organizationId?: boolean
    isOwner?: boolean
    emailVerifiedAt?: boolean
    isBlocked?: boolean
    blockedAt?: boolean
    termsAcceptedAt?: boolean
    privacyAcceptedAt?: boolean
    ageConfirmedAt?: boolean
    legalVersion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "organizationId" | "isOwner" | "emailVerifiedAt" | "isBlocked" | "blockedAt" | "termsAcceptedAt" | "privacyAcceptedAt" | "ageConfirmedAt" | "legalVersion" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    checkoutSessions?: boolean | User$checkoutSessionsArgs<ExtArgs>
    createdInvites?: boolean | User$createdInvitesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      checkoutSessions: Prisma.$BillingCheckoutSessionPayload<ExtArgs>[]
      createdInvites: Prisma.$OrganizationInvitePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      organizationId: string
      isOwner: boolean
      emailVerifiedAt: Date | null
      isBlocked: boolean
      blockedAt: Date | null
      termsAcceptedAt: Date | null
      privacyAcceptedAt: Date | null
      ageConfirmedAt: Date | null
      legalVersion: string | null
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    checkoutSessions<T extends User$checkoutSessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$checkoutSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    createdInvites<T extends User$createdInvitesArgs<ExtArgs> = {}>(args?: Subset<T, User$createdInvitesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly organizationId: FieldRef<"User", 'String'>
    readonly isOwner: FieldRef<"User", 'Boolean'>
    readonly emailVerifiedAt: FieldRef<"User", 'DateTime'>
    readonly isBlocked: FieldRef<"User", 'Boolean'>
    readonly blockedAt: FieldRef<"User", 'DateTime'>
    readonly termsAcceptedAt: FieldRef<"User", 'DateTime'>
    readonly privacyAcceptedAt: FieldRef<"User", 'DateTime'>
    readonly ageConfirmedAt: FieldRef<"User", 'DateTime'>
    readonly legalVersion: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly deletedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.checkoutSessions
   */
  export type User$checkoutSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    where?: BillingCheckoutSessionWhereInput
    orderBy?: BillingCheckoutSessionOrderByWithRelationInput | BillingCheckoutSessionOrderByWithRelationInput[]
    cursor?: BillingCheckoutSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BillingCheckoutSessionScalarFieldEnum | BillingCheckoutSessionScalarFieldEnum[]
  }

  /**
   * User.createdInvites
   */
  export type User$createdInvitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    where?: OrganizationInviteWhereInput
    orderBy?: OrganizationInviteOrderByWithRelationInput | OrganizationInviteOrderByWithRelationInput[]
    cursor?: OrganizationInviteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrganizationInviteScalarFieldEnum | OrganizationInviteScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model OrganizationInvite
   */

  export type AggregateOrganizationInvite = {
    _count: OrganizationInviteCountAggregateOutputType | null
    _min: OrganizationInviteMinAggregateOutputType | null
    _max: OrganizationInviteMaxAggregateOutputType | null
  }

  export type OrganizationInviteMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    email: string | null
    tokenHash: string | null
    expiresAt: Date | null
    createdByUserId: string | null
    acceptedAt: Date | null
    revokedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganizationInviteMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    email: string | null
    tokenHash: string | null
    expiresAt: Date | null
    createdByUserId: string | null
    acceptedAt: Date | null
    revokedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganizationInviteCountAggregateOutputType = {
    id: number
    organizationId: number
    email: number
    tokenHash: number
    expiresAt: number
    createdByUserId: number
    acceptedAt: number
    revokedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrganizationInviteMinAggregateInputType = {
    id?: true
    organizationId?: true
    email?: true
    tokenHash?: true
    expiresAt?: true
    createdByUserId?: true
    acceptedAt?: true
    revokedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganizationInviteMaxAggregateInputType = {
    id?: true
    organizationId?: true
    email?: true
    tokenHash?: true
    expiresAt?: true
    createdByUserId?: true
    acceptedAt?: true
    revokedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganizationInviteCountAggregateInputType = {
    id?: true
    organizationId?: true
    email?: true
    tokenHash?: true
    expiresAt?: true
    createdByUserId?: true
    acceptedAt?: true
    revokedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrganizationInviteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrganizationInvite to aggregate.
     */
    where?: OrganizationInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationInvites to fetch.
     */
    orderBy?: OrganizationInviteOrderByWithRelationInput | OrganizationInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganizationInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrganizationInvites
    **/
    _count?: true | OrganizationInviteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationInviteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationInviteMaxAggregateInputType
  }

  export type GetOrganizationInviteAggregateType<T extends OrganizationInviteAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganizationInvite]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganizationInvite[P]>
      : GetScalarType<T[P], AggregateOrganizationInvite[P]>
  }




  export type OrganizationInviteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationInviteWhereInput
    orderBy?: OrganizationInviteOrderByWithAggregationInput | OrganizationInviteOrderByWithAggregationInput[]
    by: OrganizationInviteScalarFieldEnum[] | OrganizationInviteScalarFieldEnum
    having?: OrganizationInviteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationInviteCountAggregateInputType | true
    _min?: OrganizationInviteMinAggregateInputType
    _max?: OrganizationInviteMaxAggregateInputType
  }

  export type OrganizationInviteGroupByOutputType = {
    id: string
    organizationId: string
    email: string
    tokenHash: string
    expiresAt: Date
    createdByUserId: string
    acceptedAt: Date | null
    revokedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: OrganizationInviteCountAggregateOutputType | null
    _min: OrganizationInviteMinAggregateOutputType | null
    _max: OrganizationInviteMaxAggregateOutputType | null
  }

  type GetOrganizationInviteGroupByPayload<T extends OrganizationInviteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationInviteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationInviteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationInviteGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationInviteGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationInviteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    email?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    createdByUserId?: boolean
    acceptedAt?: boolean
    revokedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organizationInvite"]>

  export type OrganizationInviteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    email?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    createdByUserId?: boolean
    acceptedAt?: boolean
    revokedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organizationInvite"]>

  export type OrganizationInviteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    email?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    createdByUserId?: boolean
    acceptedAt?: boolean
    revokedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organizationInvite"]>

  export type OrganizationInviteSelectScalar = {
    id?: boolean
    organizationId?: boolean
    email?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    createdByUserId?: boolean
    acceptedAt?: boolean
    revokedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrganizationInviteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "email" | "tokenHash" | "expiresAt" | "createdByUserId" | "acceptedAt" | "revokedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["organizationInvite"]>
  export type OrganizationInviteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OrganizationInviteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OrganizationInviteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $OrganizationInvitePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrganizationInvite"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      createdBy: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      email: string
      tokenHash: string
      expiresAt: Date
      createdByUserId: string
      acceptedAt: Date | null
      revokedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["organizationInvite"]>
    composites: {}
  }

  type OrganizationInviteGetPayload<S extends boolean | null | undefined | OrganizationInviteDefaultArgs> = $Result.GetResult<Prisma.$OrganizationInvitePayload, S>

  type OrganizationInviteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationInviteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationInviteCountAggregateInputType | true
    }

  export interface OrganizationInviteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrganizationInvite'], meta: { name: 'OrganizationInvite' } }
    /**
     * Find zero or one OrganizationInvite that matches the filter.
     * @param {OrganizationInviteFindUniqueArgs} args - Arguments to find a OrganizationInvite
     * @example
     * // Get one OrganizationInvite
     * const organizationInvite = await prisma.organizationInvite.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationInviteFindUniqueArgs>(args: SelectSubset<T, OrganizationInviteFindUniqueArgs<ExtArgs>>): Prisma__OrganizationInviteClient<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrganizationInvite that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationInviteFindUniqueOrThrowArgs} args - Arguments to find a OrganizationInvite
     * @example
     * // Get one OrganizationInvite
     * const organizationInvite = await prisma.organizationInvite.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationInviteFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationInviteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationInviteClient<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrganizationInvite that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationInviteFindFirstArgs} args - Arguments to find a OrganizationInvite
     * @example
     * // Get one OrganizationInvite
     * const organizationInvite = await prisma.organizationInvite.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationInviteFindFirstArgs>(args?: SelectSubset<T, OrganizationInviteFindFirstArgs<ExtArgs>>): Prisma__OrganizationInviteClient<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrganizationInvite that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationInviteFindFirstOrThrowArgs} args - Arguments to find a OrganizationInvite
     * @example
     * // Get one OrganizationInvite
     * const organizationInvite = await prisma.organizationInvite.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationInviteFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationInviteFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationInviteClient<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrganizationInvites that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationInviteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrganizationInvites
     * const organizationInvites = await prisma.organizationInvite.findMany()
     * 
     * // Get first 10 OrganizationInvites
     * const organizationInvites = await prisma.organizationInvite.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationInviteWithIdOnly = await prisma.organizationInvite.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganizationInviteFindManyArgs>(args?: SelectSubset<T, OrganizationInviteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrganizationInvite.
     * @param {OrganizationInviteCreateArgs} args - Arguments to create a OrganizationInvite.
     * @example
     * // Create one OrganizationInvite
     * const OrganizationInvite = await prisma.organizationInvite.create({
     *   data: {
     *     // ... data to create a OrganizationInvite
     *   }
     * })
     * 
     */
    create<T extends OrganizationInviteCreateArgs>(args: SelectSubset<T, OrganizationInviteCreateArgs<ExtArgs>>): Prisma__OrganizationInviteClient<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrganizationInvites.
     * @param {OrganizationInviteCreateManyArgs} args - Arguments to create many OrganizationInvites.
     * @example
     * // Create many OrganizationInvites
     * const organizationInvite = await prisma.organizationInvite.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganizationInviteCreateManyArgs>(args?: SelectSubset<T, OrganizationInviteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrganizationInvites and returns the data saved in the database.
     * @param {OrganizationInviteCreateManyAndReturnArgs} args - Arguments to create many OrganizationInvites.
     * @example
     * // Create many OrganizationInvites
     * const organizationInvite = await prisma.organizationInvite.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrganizationInvites and only return the `id`
     * const organizationInviteWithIdOnly = await prisma.organizationInvite.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganizationInviteCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganizationInviteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrganizationInvite.
     * @param {OrganizationInviteDeleteArgs} args - Arguments to delete one OrganizationInvite.
     * @example
     * // Delete one OrganizationInvite
     * const OrganizationInvite = await prisma.organizationInvite.delete({
     *   where: {
     *     // ... filter to delete one OrganizationInvite
     *   }
     * })
     * 
     */
    delete<T extends OrganizationInviteDeleteArgs>(args: SelectSubset<T, OrganizationInviteDeleteArgs<ExtArgs>>): Prisma__OrganizationInviteClient<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrganizationInvite.
     * @param {OrganizationInviteUpdateArgs} args - Arguments to update one OrganizationInvite.
     * @example
     * // Update one OrganizationInvite
     * const organizationInvite = await prisma.organizationInvite.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganizationInviteUpdateArgs>(args: SelectSubset<T, OrganizationInviteUpdateArgs<ExtArgs>>): Prisma__OrganizationInviteClient<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrganizationInvites.
     * @param {OrganizationInviteDeleteManyArgs} args - Arguments to filter OrganizationInvites to delete.
     * @example
     * // Delete a few OrganizationInvites
     * const { count } = await prisma.organizationInvite.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganizationInviteDeleteManyArgs>(args?: SelectSubset<T, OrganizationInviteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrganizationInvites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationInviteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrganizationInvites
     * const organizationInvite = await prisma.organizationInvite.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganizationInviteUpdateManyArgs>(args: SelectSubset<T, OrganizationInviteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrganizationInvites and returns the data updated in the database.
     * @param {OrganizationInviteUpdateManyAndReturnArgs} args - Arguments to update many OrganizationInvites.
     * @example
     * // Update many OrganizationInvites
     * const organizationInvite = await prisma.organizationInvite.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrganizationInvites and only return the `id`
     * const organizationInviteWithIdOnly = await prisma.organizationInvite.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrganizationInviteUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganizationInviteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrganizationInvite.
     * @param {OrganizationInviteUpsertArgs} args - Arguments to update or create a OrganizationInvite.
     * @example
     * // Update or create a OrganizationInvite
     * const organizationInvite = await prisma.organizationInvite.upsert({
     *   create: {
     *     // ... data to create a OrganizationInvite
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrganizationInvite we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationInviteUpsertArgs>(args: SelectSubset<T, OrganizationInviteUpsertArgs<ExtArgs>>): Prisma__OrganizationInviteClient<$Result.GetResult<Prisma.$OrganizationInvitePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrganizationInvites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationInviteCountArgs} args - Arguments to filter OrganizationInvites to count.
     * @example
     * // Count the number of OrganizationInvites
     * const count = await prisma.organizationInvite.count({
     *   where: {
     *     // ... the filter for the OrganizationInvites we want to count
     *   }
     * })
    **/
    count<T extends OrganizationInviteCountArgs>(
      args?: Subset<T, OrganizationInviteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationInviteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrganizationInvite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationInviteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrganizationInviteAggregateArgs>(args: Subset<T, OrganizationInviteAggregateArgs>): Prisma.PrismaPromise<GetOrganizationInviteAggregateType<T>>

    /**
     * Group by OrganizationInvite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationInviteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrganizationInviteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationInviteGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationInviteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrganizationInviteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationInviteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrganizationInvite model
   */
  readonly fields: OrganizationInviteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrganizationInvite.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationInviteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    createdBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrganizationInvite model
   */
  interface OrganizationInviteFieldRefs {
    readonly id: FieldRef<"OrganizationInvite", 'String'>
    readonly organizationId: FieldRef<"OrganizationInvite", 'String'>
    readonly email: FieldRef<"OrganizationInvite", 'String'>
    readonly tokenHash: FieldRef<"OrganizationInvite", 'String'>
    readonly expiresAt: FieldRef<"OrganizationInvite", 'DateTime'>
    readonly createdByUserId: FieldRef<"OrganizationInvite", 'String'>
    readonly acceptedAt: FieldRef<"OrganizationInvite", 'DateTime'>
    readonly revokedAt: FieldRef<"OrganizationInvite", 'DateTime'>
    readonly createdAt: FieldRef<"OrganizationInvite", 'DateTime'>
    readonly updatedAt: FieldRef<"OrganizationInvite", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrganizationInvite findUnique
   */
  export type OrganizationInviteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationInvite to fetch.
     */
    where: OrganizationInviteWhereUniqueInput
  }

  /**
   * OrganizationInvite findUniqueOrThrow
   */
  export type OrganizationInviteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationInvite to fetch.
     */
    where: OrganizationInviteWhereUniqueInput
  }

  /**
   * OrganizationInvite findFirst
   */
  export type OrganizationInviteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationInvite to fetch.
     */
    where?: OrganizationInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationInvites to fetch.
     */
    orderBy?: OrganizationInviteOrderByWithRelationInput | OrganizationInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrganizationInvites.
     */
    cursor?: OrganizationInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrganizationInvites.
     */
    distinct?: OrganizationInviteScalarFieldEnum | OrganizationInviteScalarFieldEnum[]
  }

  /**
   * OrganizationInvite findFirstOrThrow
   */
  export type OrganizationInviteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationInvite to fetch.
     */
    where?: OrganizationInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationInvites to fetch.
     */
    orderBy?: OrganizationInviteOrderByWithRelationInput | OrganizationInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrganizationInvites.
     */
    cursor?: OrganizationInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrganizationInvites.
     */
    distinct?: OrganizationInviteScalarFieldEnum | OrganizationInviteScalarFieldEnum[]
  }

  /**
   * OrganizationInvite findMany
   */
  export type OrganizationInviteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationInvites to fetch.
     */
    where?: OrganizationInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationInvites to fetch.
     */
    orderBy?: OrganizationInviteOrderByWithRelationInput | OrganizationInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrganizationInvites.
     */
    cursor?: OrganizationInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationInvites.
     */
    skip?: number
    distinct?: OrganizationInviteScalarFieldEnum | OrganizationInviteScalarFieldEnum[]
  }

  /**
   * OrganizationInvite create
   */
  export type OrganizationInviteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    /**
     * The data needed to create a OrganizationInvite.
     */
    data: XOR<OrganizationInviteCreateInput, OrganizationInviteUncheckedCreateInput>
  }

  /**
   * OrganizationInvite createMany
   */
  export type OrganizationInviteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrganizationInvites.
     */
    data: OrganizationInviteCreateManyInput | OrganizationInviteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrganizationInvite createManyAndReturn
   */
  export type OrganizationInviteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * The data used to create many OrganizationInvites.
     */
    data: OrganizationInviteCreateManyInput | OrganizationInviteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrganizationInvite update
   */
  export type OrganizationInviteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    /**
     * The data needed to update a OrganizationInvite.
     */
    data: XOR<OrganizationInviteUpdateInput, OrganizationInviteUncheckedUpdateInput>
    /**
     * Choose, which OrganizationInvite to update.
     */
    where: OrganizationInviteWhereUniqueInput
  }

  /**
   * OrganizationInvite updateMany
   */
  export type OrganizationInviteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrganizationInvites.
     */
    data: XOR<OrganizationInviteUpdateManyMutationInput, OrganizationInviteUncheckedUpdateManyInput>
    /**
     * Filter which OrganizationInvites to update
     */
    where?: OrganizationInviteWhereInput
    /**
     * Limit how many OrganizationInvites to update.
     */
    limit?: number
  }

  /**
   * OrganizationInvite updateManyAndReturn
   */
  export type OrganizationInviteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * The data used to update OrganizationInvites.
     */
    data: XOR<OrganizationInviteUpdateManyMutationInput, OrganizationInviteUncheckedUpdateManyInput>
    /**
     * Filter which OrganizationInvites to update
     */
    where?: OrganizationInviteWhereInput
    /**
     * Limit how many OrganizationInvites to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrganizationInvite upsert
   */
  export type OrganizationInviteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    /**
     * The filter to search for the OrganizationInvite to update in case it exists.
     */
    where: OrganizationInviteWhereUniqueInput
    /**
     * In case the OrganizationInvite found by the `where` argument doesn't exist, create a new OrganizationInvite with this data.
     */
    create: XOR<OrganizationInviteCreateInput, OrganizationInviteUncheckedCreateInput>
    /**
     * In case the OrganizationInvite was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationInviteUpdateInput, OrganizationInviteUncheckedUpdateInput>
  }

  /**
   * OrganizationInvite delete
   */
  export type OrganizationInviteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
    /**
     * Filter which OrganizationInvite to delete.
     */
    where: OrganizationInviteWhereUniqueInput
  }

  /**
   * OrganizationInvite deleteMany
   */
  export type OrganizationInviteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrganizationInvites to delete
     */
    where?: OrganizationInviteWhereInput
    /**
     * Limit how many OrganizationInvites to delete.
     */
    limit?: number
  }

  /**
   * OrganizationInvite without action
   */
  export type OrganizationInviteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationInvite
     */
    select?: OrganizationInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationInvite
     */
    omit?: OrganizationInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInviteInclude<ExtArgs> | null
  }


  /**
   * Model DomainGroup
   */

  export type AggregateDomainGroup = {
    _count: DomainGroupCountAggregateOutputType | null
    _min: DomainGroupMinAggregateOutputType | null
    _max: DomainGroupMaxAggregateOutputType | null
  }

  export type DomainGroupMinAggregateOutputType = {
    id: string | null
    name: string | null
    organizationId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type DomainGroupMaxAggregateOutputType = {
    id: string | null
    name: string | null
    organizationId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type DomainGroupCountAggregateOutputType = {
    id: number
    name: number
    organizationId: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type DomainGroupMinAggregateInputType = {
    id?: true
    name?: true
    organizationId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type DomainGroupMaxAggregateInputType = {
    id?: true
    name?: true
    organizationId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type DomainGroupCountAggregateInputType = {
    id?: true
    name?: true
    organizationId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type DomainGroupAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DomainGroup to aggregate.
     */
    where?: DomainGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomainGroups to fetch.
     */
    orderBy?: DomainGroupOrderByWithRelationInput | DomainGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DomainGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomainGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomainGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DomainGroups
    **/
    _count?: true | DomainGroupCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DomainGroupMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DomainGroupMaxAggregateInputType
  }

  export type GetDomainGroupAggregateType<T extends DomainGroupAggregateArgs> = {
        [P in keyof T & keyof AggregateDomainGroup]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDomainGroup[P]>
      : GetScalarType<T[P], AggregateDomainGroup[P]>
  }




  export type DomainGroupGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DomainGroupWhereInput
    orderBy?: DomainGroupOrderByWithAggregationInput | DomainGroupOrderByWithAggregationInput[]
    by: DomainGroupScalarFieldEnum[] | DomainGroupScalarFieldEnum
    having?: DomainGroupScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DomainGroupCountAggregateInputType | true
    _min?: DomainGroupMinAggregateInputType
    _max?: DomainGroupMaxAggregateInputType
  }

  export type DomainGroupGroupByOutputType = {
    id: string
    name: string
    organizationId: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: DomainGroupCountAggregateOutputType | null
    _min: DomainGroupMinAggregateOutputType | null
    _max: DomainGroupMaxAggregateOutputType | null
  }

  type GetDomainGroupGroupByPayload<T extends DomainGroupGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DomainGroupGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DomainGroupGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DomainGroupGroupByOutputType[P]>
            : GetScalarType<T[P], DomainGroupGroupByOutputType[P]>
        }
      >
    >


  export type DomainGroupSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    organizationId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    domains?: boolean | DomainGroup$domainsArgs<ExtArgs>
    redirectRules?: boolean | DomainGroup$redirectRulesArgs<ExtArgs>
    linkMaps?: boolean | DomainGroup$linkMapsArgs<ExtArgs>
    redirectTests?: boolean | DomainGroup$redirectTestsArgs<ExtArgs>
    _count?: boolean | DomainGroupCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["domainGroup"]>

  export type DomainGroupSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    organizationId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["domainGroup"]>

  export type DomainGroupSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    organizationId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["domainGroup"]>

  export type DomainGroupSelectScalar = {
    id?: boolean
    name?: boolean
    organizationId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type DomainGroupOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "organizationId" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["domainGroup"]>
  export type DomainGroupInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    domains?: boolean | DomainGroup$domainsArgs<ExtArgs>
    redirectRules?: boolean | DomainGroup$redirectRulesArgs<ExtArgs>
    linkMaps?: boolean | DomainGroup$linkMapsArgs<ExtArgs>
    redirectTests?: boolean | DomainGroup$redirectTestsArgs<ExtArgs>
    _count?: boolean | DomainGroupCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DomainGroupIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type DomainGroupIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $DomainGroupPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DomainGroup"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      domains: Prisma.$DomainPayload<ExtArgs>[]
      redirectRules: Prisma.$RedirectRulePayload<ExtArgs>[]
      linkMaps: Prisma.$LinkMapPayload<ExtArgs>[]
      redirectTests: Prisma.$RedirectTestPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      organizationId: string
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["domainGroup"]>
    composites: {}
  }

  type DomainGroupGetPayload<S extends boolean | null | undefined | DomainGroupDefaultArgs> = $Result.GetResult<Prisma.$DomainGroupPayload, S>

  type DomainGroupCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DomainGroupFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DomainGroupCountAggregateInputType | true
    }

  export interface DomainGroupDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DomainGroup'], meta: { name: 'DomainGroup' } }
    /**
     * Find zero or one DomainGroup that matches the filter.
     * @param {DomainGroupFindUniqueArgs} args - Arguments to find a DomainGroup
     * @example
     * // Get one DomainGroup
     * const domainGroup = await prisma.domainGroup.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DomainGroupFindUniqueArgs>(args: SelectSubset<T, DomainGroupFindUniqueArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DomainGroup that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DomainGroupFindUniqueOrThrowArgs} args - Arguments to find a DomainGroup
     * @example
     * // Get one DomainGroup
     * const domainGroup = await prisma.domainGroup.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DomainGroupFindUniqueOrThrowArgs>(args: SelectSubset<T, DomainGroupFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DomainGroup that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainGroupFindFirstArgs} args - Arguments to find a DomainGroup
     * @example
     * // Get one DomainGroup
     * const domainGroup = await prisma.domainGroup.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DomainGroupFindFirstArgs>(args?: SelectSubset<T, DomainGroupFindFirstArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DomainGroup that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainGroupFindFirstOrThrowArgs} args - Arguments to find a DomainGroup
     * @example
     * // Get one DomainGroup
     * const domainGroup = await prisma.domainGroup.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DomainGroupFindFirstOrThrowArgs>(args?: SelectSubset<T, DomainGroupFindFirstOrThrowArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DomainGroups that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainGroupFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DomainGroups
     * const domainGroups = await prisma.domainGroup.findMany()
     * 
     * // Get first 10 DomainGroups
     * const domainGroups = await prisma.domainGroup.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const domainGroupWithIdOnly = await prisma.domainGroup.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DomainGroupFindManyArgs>(args?: SelectSubset<T, DomainGroupFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DomainGroup.
     * @param {DomainGroupCreateArgs} args - Arguments to create a DomainGroup.
     * @example
     * // Create one DomainGroup
     * const DomainGroup = await prisma.domainGroup.create({
     *   data: {
     *     // ... data to create a DomainGroup
     *   }
     * })
     * 
     */
    create<T extends DomainGroupCreateArgs>(args: SelectSubset<T, DomainGroupCreateArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DomainGroups.
     * @param {DomainGroupCreateManyArgs} args - Arguments to create many DomainGroups.
     * @example
     * // Create many DomainGroups
     * const domainGroup = await prisma.domainGroup.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DomainGroupCreateManyArgs>(args?: SelectSubset<T, DomainGroupCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DomainGroups and returns the data saved in the database.
     * @param {DomainGroupCreateManyAndReturnArgs} args - Arguments to create many DomainGroups.
     * @example
     * // Create many DomainGroups
     * const domainGroup = await prisma.domainGroup.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DomainGroups and only return the `id`
     * const domainGroupWithIdOnly = await prisma.domainGroup.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DomainGroupCreateManyAndReturnArgs>(args?: SelectSubset<T, DomainGroupCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DomainGroup.
     * @param {DomainGroupDeleteArgs} args - Arguments to delete one DomainGroup.
     * @example
     * // Delete one DomainGroup
     * const DomainGroup = await prisma.domainGroup.delete({
     *   where: {
     *     // ... filter to delete one DomainGroup
     *   }
     * })
     * 
     */
    delete<T extends DomainGroupDeleteArgs>(args: SelectSubset<T, DomainGroupDeleteArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DomainGroup.
     * @param {DomainGroupUpdateArgs} args - Arguments to update one DomainGroup.
     * @example
     * // Update one DomainGroup
     * const domainGroup = await prisma.domainGroup.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DomainGroupUpdateArgs>(args: SelectSubset<T, DomainGroupUpdateArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DomainGroups.
     * @param {DomainGroupDeleteManyArgs} args - Arguments to filter DomainGroups to delete.
     * @example
     * // Delete a few DomainGroups
     * const { count } = await prisma.domainGroup.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DomainGroupDeleteManyArgs>(args?: SelectSubset<T, DomainGroupDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DomainGroups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainGroupUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DomainGroups
     * const domainGroup = await prisma.domainGroup.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DomainGroupUpdateManyArgs>(args: SelectSubset<T, DomainGroupUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DomainGroups and returns the data updated in the database.
     * @param {DomainGroupUpdateManyAndReturnArgs} args - Arguments to update many DomainGroups.
     * @example
     * // Update many DomainGroups
     * const domainGroup = await prisma.domainGroup.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DomainGroups and only return the `id`
     * const domainGroupWithIdOnly = await prisma.domainGroup.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DomainGroupUpdateManyAndReturnArgs>(args: SelectSubset<T, DomainGroupUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DomainGroup.
     * @param {DomainGroupUpsertArgs} args - Arguments to update or create a DomainGroup.
     * @example
     * // Update or create a DomainGroup
     * const domainGroup = await prisma.domainGroup.upsert({
     *   create: {
     *     // ... data to create a DomainGroup
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DomainGroup we want to update
     *   }
     * })
     */
    upsert<T extends DomainGroupUpsertArgs>(args: SelectSubset<T, DomainGroupUpsertArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DomainGroups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainGroupCountArgs} args - Arguments to filter DomainGroups to count.
     * @example
     * // Count the number of DomainGroups
     * const count = await prisma.domainGroup.count({
     *   where: {
     *     // ... the filter for the DomainGroups we want to count
     *   }
     * })
    **/
    count<T extends DomainGroupCountArgs>(
      args?: Subset<T, DomainGroupCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DomainGroupCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DomainGroup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainGroupAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DomainGroupAggregateArgs>(args: Subset<T, DomainGroupAggregateArgs>): Prisma.PrismaPromise<GetDomainGroupAggregateType<T>>

    /**
     * Group by DomainGroup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainGroupGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DomainGroupGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DomainGroupGroupByArgs['orderBy'] }
        : { orderBy?: DomainGroupGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DomainGroupGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDomainGroupGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DomainGroup model
   */
  readonly fields: DomainGroupFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DomainGroup.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DomainGroupClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    domains<T extends DomainGroup$domainsArgs<ExtArgs> = {}>(args?: Subset<T, DomainGroup$domainsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    redirectRules<T extends DomainGroup$redirectRulesArgs<ExtArgs> = {}>(args?: Subset<T, DomainGroup$redirectRulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    linkMaps<T extends DomainGroup$linkMapsArgs<ExtArgs> = {}>(args?: Subset<T, DomainGroup$linkMapsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    redirectTests<T extends DomainGroup$redirectTestsArgs<ExtArgs> = {}>(args?: Subset<T, DomainGroup$redirectTestsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DomainGroup model
   */
  interface DomainGroupFieldRefs {
    readonly id: FieldRef<"DomainGroup", 'String'>
    readonly name: FieldRef<"DomainGroup", 'String'>
    readonly organizationId: FieldRef<"DomainGroup", 'String'>
    readonly createdAt: FieldRef<"DomainGroup", 'DateTime'>
    readonly updatedAt: FieldRef<"DomainGroup", 'DateTime'>
    readonly deletedAt: FieldRef<"DomainGroup", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DomainGroup findUnique
   */
  export type DomainGroupFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
    /**
     * Filter, which DomainGroup to fetch.
     */
    where: DomainGroupWhereUniqueInput
  }

  /**
   * DomainGroup findUniqueOrThrow
   */
  export type DomainGroupFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
    /**
     * Filter, which DomainGroup to fetch.
     */
    where: DomainGroupWhereUniqueInput
  }

  /**
   * DomainGroup findFirst
   */
  export type DomainGroupFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
    /**
     * Filter, which DomainGroup to fetch.
     */
    where?: DomainGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomainGroups to fetch.
     */
    orderBy?: DomainGroupOrderByWithRelationInput | DomainGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DomainGroups.
     */
    cursor?: DomainGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomainGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomainGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DomainGroups.
     */
    distinct?: DomainGroupScalarFieldEnum | DomainGroupScalarFieldEnum[]
  }

  /**
   * DomainGroup findFirstOrThrow
   */
  export type DomainGroupFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
    /**
     * Filter, which DomainGroup to fetch.
     */
    where?: DomainGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomainGroups to fetch.
     */
    orderBy?: DomainGroupOrderByWithRelationInput | DomainGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DomainGroups.
     */
    cursor?: DomainGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomainGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomainGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DomainGroups.
     */
    distinct?: DomainGroupScalarFieldEnum | DomainGroupScalarFieldEnum[]
  }

  /**
   * DomainGroup findMany
   */
  export type DomainGroupFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
    /**
     * Filter, which DomainGroups to fetch.
     */
    where?: DomainGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomainGroups to fetch.
     */
    orderBy?: DomainGroupOrderByWithRelationInput | DomainGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DomainGroups.
     */
    cursor?: DomainGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomainGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomainGroups.
     */
    skip?: number
    distinct?: DomainGroupScalarFieldEnum | DomainGroupScalarFieldEnum[]
  }

  /**
   * DomainGroup create
   */
  export type DomainGroupCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
    /**
     * The data needed to create a DomainGroup.
     */
    data: XOR<DomainGroupCreateInput, DomainGroupUncheckedCreateInput>
  }

  /**
   * DomainGroup createMany
   */
  export type DomainGroupCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DomainGroups.
     */
    data: DomainGroupCreateManyInput | DomainGroupCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DomainGroup createManyAndReturn
   */
  export type DomainGroupCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * The data used to create many DomainGroups.
     */
    data: DomainGroupCreateManyInput | DomainGroupCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DomainGroup update
   */
  export type DomainGroupUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
    /**
     * The data needed to update a DomainGroup.
     */
    data: XOR<DomainGroupUpdateInput, DomainGroupUncheckedUpdateInput>
    /**
     * Choose, which DomainGroup to update.
     */
    where: DomainGroupWhereUniqueInput
  }

  /**
   * DomainGroup updateMany
   */
  export type DomainGroupUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DomainGroups.
     */
    data: XOR<DomainGroupUpdateManyMutationInput, DomainGroupUncheckedUpdateManyInput>
    /**
     * Filter which DomainGroups to update
     */
    where?: DomainGroupWhereInput
    /**
     * Limit how many DomainGroups to update.
     */
    limit?: number
  }

  /**
   * DomainGroup updateManyAndReturn
   */
  export type DomainGroupUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * The data used to update DomainGroups.
     */
    data: XOR<DomainGroupUpdateManyMutationInput, DomainGroupUncheckedUpdateManyInput>
    /**
     * Filter which DomainGroups to update
     */
    where?: DomainGroupWhereInput
    /**
     * Limit how many DomainGroups to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DomainGroup upsert
   */
  export type DomainGroupUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
    /**
     * The filter to search for the DomainGroup to update in case it exists.
     */
    where: DomainGroupWhereUniqueInput
    /**
     * In case the DomainGroup found by the `where` argument doesn't exist, create a new DomainGroup with this data.
     */
    create: XOR<DomainGroupCreateInput, DomainGroupUncheckedCreateInput>
    /**
     * In case the DomainGroup was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DomainGroupUpdateInput, DomainGroupUncheckedUpdateInput>
  }

  /**
   * DomainGroup delete
   */
  export type DomainGroupDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
    /**
     * Filter which DomainGroup to delete.
     */
    where: DomainGroupWhereUniqueInput
  }

  /**
   * DomainGroup deleteMany
   */
  export type DomainGroupDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DomainGroups to delete
     */
    where?: DomainGroupWhereInput
    /**
     * Limit how many DomainGroups to delete.
     */
    limit?: number
  }

  /**
   * DomainGroup.domains
   */
  export type DomainGroup$domainsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
    where?: DomainWhereInput
    orderBy?: DomainOrderByWithRelationInput | DomainOrderByWithRelationInput[]
    cursor?: DomainWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DomainScalarFieldEnum | DomainScalarFieldEnum[]
  }

  /**
   * DomainGroup.redirectRules
   */
  export type DomainGroup$redirectRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    where?: RedirectRuleWhereInput
    orderBy?: RedirectRuleOrderByWithRelationInput | RedirectRuleOrderByWithRelationInput[]
    cursor?: RedirectRuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RedirectRuleScalarFieldEnum | RedirectRuleScalarFieldEnum[]
  }

  /**
   * DomainGroup.linkMaps
   */
  export type DomainGroup$linkMapsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    where?: LinkMapWhereInput
    orderBy?: LinkMapOrderByWithRelationInput | LinkMapOrderByWithRelationInput[]
    cursor?: LinkMapWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LinkMapScalarFieldEnum | LinkMapScalarFieldEnum[]
  }

  /**
   * DomainGroup.redirectTests
   */
  export type DomainGroup$redirectTestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    where?: RedirectTestWhereInput
    orderBy?: RedirectTestOrderByWithRelationInput | RedirectTestOrderByWithRelationInput[]
    cursor?: RedirectTestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RedirectTestScalarFieldEnum | RedirectTestScalarFieldEnum[]
  }

  /**
   * DomainGroup without action
   */
  export type DomainGroupDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DomainGroup
     */
    select?: DomainGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DomainGroup
     */
    omit?: DomainGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainGroupInclude<ExtArgs> | null
  }


  /**
   * Model Domain
   */

  export type AggregateDomain = {
    _count: DomainCountAggregateOutputType | null
    _min: DomainMinAggregateOutputType | null
    _max: DomainMaxAggregateOutputType | null
  }

  export type DomainMinAggregateOutputType = {
    id: string | null
    name: string | null
    domainGroupId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type DomainMaxAggregateOutputType = {
    id: string | null
    name: string | null
    domainGroupId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type DomainCountAggregateOutputType = {
    id: number
    name: number
    domainGroupId: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type DomainMinAggregateInputType = {
    id?: true
    name?: true
    domainGroupId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type DomainMaxAggregateInputType = {
    id?: true
    name?: true
    domainGroupId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type DomainCountAggregateInputType = {
    id?: true
    name?: true
    domainGroupId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type DomainAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Domain to aggregate.
     */
    where?: DomainWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Domains to fetch.
     */
    orderBy?: DomainOrderByWithRelationInput | DomainOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DomainWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Domains from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Domains.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Domains
    **/
    _count?: true | DomainCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DomainMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DomainMaxAggregateInputType
  }

  export type GetDomainAggregateType<T extends DomainAggregateArgs> = {
        [P in keyof T & keyof AggregateDomain]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDomain[P]>
      : GetScalarType<T[P], AggregateDomain[P]>
  }




  export type DomainGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DomainWhereInput
    orderBy?: DomainOrderByWithAggregationInput | DomainOrderByWithAggregationInput[]
    by: DomainScalarFieldEnum[] | DomainScalarFieldEnum
    having?: DomainScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DomainCountAggregateInputType | true
    _min?: DomainMinAggregateInputType
    _max?: DomainMaxAggregateInputType
  }

  export type DomainGroupByOutputType = {
    id: string
    name: string
    domainGroupId: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: DomainCountAggregateOutputType | null
    _min: DomainMinAggregateOutputType | null
    _max: DomainMaxAggregateOutputType | null
  }

  type GetDomainGroupByPayload<T extends DomainGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DomainGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DomainGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DomainGroupByOutputType[P]>
            : GetScalarType<T[P], DomainGroupByOutputType[P]>
        }
      >
    >


  export type DomainSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["domain"]>

  export type DomainSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["domain"]>

  export type DomainSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["domain"]>

  export type DomainSelectScalar = {
    id?: boolean
    name?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type DomainOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "domainGroupId" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["domain"]>
  export type DomainInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }
  export type DomainIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }
  export type DomainIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }

  export type $DomainPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Domain"
    objects: {
      domainGroup: Prisma.$DomainGroupPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      domainGroupId: string
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["domain"]>
    composites: {}
  }

  type DomainGetPayload<S extends boolean | null | undefined | DomainDefaultArgs> = $Result.GetResult<Prisma.$DomainPayload, S>

  type DomainCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DomainFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DomainCountAggregateInputType | true
    }

  export interface DomainDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Domain'], meta: { name: 'Domain' } }
    /**
     * Find zero or one Domain that matches the filter.
     * @param {DomainFindUniqueArgs} args - Arguments to find a Domain
     * @example
     * // Get one Domain
     * const domain = await prisma.domain.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DomainFindUniqueArgs>(args: SelectSubset<T, DomainFindUniqueArgs<ExtArgs>>): Prisma__DomainClient<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Domain that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DomainFindUniqueOrThrowArgs} args - Arguments to find a Domain
     * @example
     * // Get one Domain
     * const domain = await prisma.domain.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DomainFindUniqueOrThrowArgs>(args: SelectSubset<T, DomainFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DomainClient<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Domain that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainFindFirstArgs} args - Arguments to find a Domain
     * @example
     * // Get one Domain
     * const domain = await prisma.domain.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DomainFindFirstArgs>(args?: SelectSubset<T, DomainFindFirstArgs<ExtArgs>>): Prisma__DomainClient<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Domain that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainFindFirstOrThrowArgs} args - Arguments to find a Domain
     * @example
     * // Get one Domain
     * const domain = await prisma.domain.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DomainFindFirstOrThrowArgs>(args?: SelectSubset<T, DomainFindFirstOrThrowArgs<ExtArgs>>): Prisma__DomainClient<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Domains that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Domains
     * const domains = await prisma.domain.findMany()
     * 
     * // Get first 10 Domains
     * const domains = await prisma.domain.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const domainWithIdOnly = await prisma.domain.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DomainFindManyArgs>(args?: SelectSubset<T, DomainFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Domain.
     * @param {DomainCreateArgs} args - Arguments to create a Domain.
     * @example
     * // Create one Domain
     * const Domain = await prisma.domain.create({
     *   data: {
     *     // ... data to create a Domain
     *   }
     * })
     * 
     */
    create<T extends DomainCreateArgs>(args: SelectSubset<T, DomainCreateArgs<ExtArgs>>): Prisma__DomainClient<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Domains.
     * @param {DomainCreateManyArgs} args - Arguments to create many Domains.
     * @example
     * // Create many Domains
     * const domain = await prisma.domain.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DomainCreateManyArgs>(args?: SelectSubset<T, DomainCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Domains and returns the data saved in the database.
     * @param {DomainCreateManyAndReturnArgs} args - Arguments to create many Domains.
     * @example
     * // Create many Domains
     * const domain = await prisma.domain.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Domains and only return the `id`
     * const domainWithIdOnly = await prisma.domain.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DomainCreateManyAndReturnArgs>(args?: SelectSubset<T, DomainCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Domain.
     * @param {DomainDeleteArgs} args - Arguments to delete one Domain.
     * @example
     * // Delete one Domain
     * const Domain = await prisma.domain.delete({
     *   where: {
     *     // ... filter to delete one Domain
     *   }
     * })
     * 
     */
    delete<T extends DomainDeleteArgs>(args: SelectSubset<T, DomainDeleteArgs<ExtArgs>>): Prisma__DomainClient<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Domain.
     * @param {DomainUpdateArgs} args - Arguments to update one Domain.
     * @example
     * // Update one Domain
     * const domain = await prisma.domain.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DomainUpdateArgs>(args: SelectSubset<T, DomainUpdateArgs<ExtArgs>>): Prisma__DomainClient<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Domains.
     * @param {DomainDeleteManyArgs} args - Arguments to filter Domains to delete.
     * @example
     * // Delete a few Domains
     * const { count } = await prisma.domain.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DomainDeleteManyArgs>(args?: SelectSubset<T, DomainDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Domains.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Domains
     * const domain = await prisma.domain.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DomainUpdateManyArgs>(args: SelectSubset<T, DomainUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Domains and returns the data updated in the database.
     * @param {DomainUpdateManyAndReturnArgs} args - Arguments to update many Domains.
     * @example
     * // Update many Domains
     * const domain = await prisma.domain.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Domains and only return the `id`
     * const domainWithIdOnly = await prisma.domain.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DomainUpdateManyAndReturnArgs>(args: SelectSubset<T, DomainUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Domain.
     * @param {DomainUpsertArgs} args - Arguments to update or create a Domain.
     * @example
     * // Update or create a Domain
     * const domain = await prisma.domain.upsert({
     *   create: {
     *     // ... data to create a Domain
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Domain we want to update
     *   }
     * })
     */
    upsert<T extends DomainUpsertArgs>(args: SelectSubset<T, DomainUpsertArgs<ExtArgs>>): Prisma__DomainClient<$Result.GetResult<Prisma.$DomainPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Domains.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainCountArgs} args - Arguments to filter Domains to count.
     * @example
     * // Count the number of Domains
     * const count = await prisma.domain.count({
     *   where: {
     *     // ... the filter for the Domains we want to count
     *   }
     * })
    **/
    count<T extends DomainCountArgs>(
      args?: Subset<T, DomainCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DomainCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Domain.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DomainAggregateArgs>(args: Subset<T, DomainAggregateArgs>): Prisma.PrismaPromise<GetDomainAggregateType<T>>

    /**
     * Group by Domain.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomainGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DomainGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DomainGroupByArgs['orderBy'] }
        : { orderBy?: DomainGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DomainGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDomainGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Domain model
   */
  readonly fields: DomainFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Domain.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DomainClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    domainGroup<T extends DomainGroupDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DomainGroupDefaultArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Domain model
   */
  interface DomainFieldRefs {
    readonly id: FieldRef<"Domain", 'String'>
    readonly name: FieldRef<"Domain", 'String'>
    readonly domainGroupId: FieldRef<"Domain", 'String'>
    readonly createdAt: FieldRef<"Domain", 'DateTime'>
    readonly updatedAt: FieldRef<"Domain", 'DateTime'>
    readonly deletedAt: FieldRef<"Domain", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Domain findUnique
   */
  export type DomainFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
    /**
     * Filter, which Domain to fetch.
     */
    where: DomainWhereUniqueInput
  }

  /**
   * Domain findUniqueOrThrow
   */
  export type DomainFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
    /**
     * Filter, which Domain to fetch.
     */
    where: DomainWhereUniqueInput
  }

  /**
   * Domain findFirst
   */
  export type DomainFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
    /**
     * Filter, which Domain to fetch.
     */
    where?: DomainWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Domains to fetch.
     */
    orderBy?: DomainOrderByWithRelationInput | DomainOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Domains.
     */
    cursor?: DomainWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Domains from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Domains.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Domains.
     */
    distinct?: DomainScalarFieldEnum | DomainScalarFieldEnum[]
  }

  /**
   * Domain findFirstOrThrow
   */
  export type DomainFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
    /**
     * Filter, which Domain to fetch.
     */
    where?: DomainWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Domains to fetch.
     */
    orderBy?: DomainOrderByWithRelationInput | DomainOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Domains.
     */
    cursor?: DomainWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Domains from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Domains.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Domains.
     */
    distinct?: DomainScalarFieldEnum | DomainScalarFieldEnum[]
  }

  /**
   * Domain findMany
   */
  export type DomainFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
    /**
     * Filter, which Domains to fetch.
     */
    where?: DomainWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Domains to fetch.
     */
    orderBy?: DomainOrderByWithRelationInput | DomainOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Domains.
     */
    cursor?: DomainWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Domains from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Domains.
     */
    skip?: number
    distinct?: DomainScalarFieldEnum | DomainScalarFieldEnum[]
  }

  /**
   * Domain create
   */
  export type DomainCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
    /**
     * The data needed to create a Domain.
     */
    data: XOR<DomainCreateInput, DomainUncheckedCreateInput>
  }

  /**
   * Domain createMany
   */
  export type DomainCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Domains.
     */
    data: DomainCreateManyInput | DomainCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Domain createManyAndReturn
   */
  export type DomainCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * The data used to create many Domains.
     */
    data: DomainCreateManyInput | DomainCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Domain update
   */
  export type DomainUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
    /**
     * The data needed to update a Domain.
     */
    data: XOR<DomainUpdateInput, DomainUncheckedUpdateInput>
    /**
     * Choose, which Domain to update.
     */
    where: DomainWhereUniqueInput
  }

  /**
   * Domain updateMany
   */
  export type DomainUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Domains.
     */
    data: XOR<DomainUpdateManyMutationInput, DomainUncheckedUpdateManyInput>
    /**
     * Filter which Domains to update
     */
    where?: DomainWhereInput
    /**
     * Limit how many Domains to update.
     */
    limit?: number
  }

  /**
   * Domain updateManyAndReturn
   */
  export type DomainUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * The data used to update Domains.
     */
    data: XOR<DomainUpdateManyMutationInput, DomainUncheckedUpdateManyInput>
    /**
     * Filter which Domains to update
     */
    where?: DomainWhereInput
    /**
     * Limit how many Domains to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Domain upsert
   */
  export type DomainUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
    /**
     * The filter to search for the Domain to update in case it exists.
     */
    where: DomainWhereUniqueInput
    /**
     * In case the Domain found by the `where` argument doesn't exist, create a new Domain with this data.
     */
    create: XOR<DomainCreateInput, DomainUncheckedCreateInput>
    /**
     * In case the Domain was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DomainUpdateInput, DomainUncheckedUpdateInput>
  }

  /**
   * Domain delete
   */
  export type DomainDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
    /**
     * Filter which Domain to delete.
     */
    where: DomainWhereUniqueInput
  }

  /**
   * Domain deleteMany
   */
  export type DomainDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Domains to delete
     */
    where?: DomainWhereInput
    /**
     * Limit how many Domains to delete.
     */
    limit?: number
  }

  /**
   * Domain without action
   */
  export type DomainDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Domain
     */
    select?: DomainSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Domain
     */
    omit?: DomainOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DomainInclude<ExtArgs> | null
  }


  /**
   * Model RedirectRule
   */

  export type AggregateRedirectRule = {
    _count: RedirectRuleCountAggregateOutputType | null
    _avg: RedirectRuleAvgAggregateOutputType | null
    _sum: RedirectRuleSumAggregateOutputType | null
    _min: RedirectRuleMinAggregateOutputType | null
    _max: RedirectRuleMaxAggregateOutputType | null
  }

  export type RedirectRuleAvgAggregateOutputType = {
    statusCode: number | null
    priority: number | null
  }

  export type RedirectRuleSumAggregateOutputType = {
    statusCode: number | null
    priority: number | null
  }

  export type RedirectRuleMinAggregateOutputType = {
    id: string | null
    source: string | null
    destination: string | null
    statusCode: number | null
    queryMatch: $Enums.RedirectQueryMatch | null
    pathMatch: $Enums.RedirectPathMatch | null
    linkMapId: string | null
    isBlocked: boolean | null
    blockedAt: Date | null
    priority: number | null
    domainGroupId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type RedirectRuleMaxAggregateOutputType = {
    id: string | null
    source: string | null
    destination: string | null
    statusCode: number | null
    queryMatch: $Enums.RedirectQueryMatch | null
    pathMatch: $Enums.RedirectPathMatch | null
    linkMapId: string | null
    isBlocked: boolean | null
    blockedAt: Date | null
    priority: number | null
    domainGroupId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type RedirectRuleCountAggregateOutputType = {
    id: number
    source: number
    destination: number
    statusCode: number
    matchMethod: number
    queryMatch: number
    pathMatch: number
    linkMapId: number
    isBlocked: number
    blockedAt: number
    priority: number
    domainGroupId: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type RedirectRuleAvgAggregateInputType = {
    statusCode?: true
    priority?: true
  }

  export type RedirectRuleSumAggregateInputType = {
    statusCode?: true
    priority?: true
  }

  export type RedirectRuleMinAggregateInputType = {
    id?: true
    source?: true
    destination?: true
    statusCode?: true
    queryMatch?: true
    pathMatch?: true
    linkMapId?: true
    isBlocked?: true
    blockedAt?: true
    priority?: true
    domainGroupId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type RedirectRuleMaxAggregateInputType = {
    id?: true
    source?: true
    destination?: true
    statusCode?: true
    queryMatch?: true
    pathMatch?: true
    linkMapId?: true
    isBlocked?: true
    blockedAt?: true
    priority?: true
    domainGroupId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type RedirectRuleCountAggregateInputType = {
    id?: true
    source?: true
    destination?: true
    statusCode?: true
    matchMethod?: true
    queryMatch?: true
    pathMatch?: true
    linkMapId?: true
    isBlocked?: true
    blockedAt?: true
    priority?: true
    domainGroupId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type RedirectRuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RedirectRule to aggregate.
     */
    where?: RedirectRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectRules to fetch.
     */
    orderBy?: RedirectRuleOrderByWithRelationInput | RedirectRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RedirectRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RedirectRules
    **/
    _count?: true | RedirectRuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RedirectRuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RedirectRuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RedirectRuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RedirectRuleMaxAggregateInputType
  }

  export type GetRedirectRuleAggregateType<T extends RedirectRuleAggregateArgs> = {
        [P in keyof T & keyof AggregateRedirectRule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRedirectRule[P]>
      : GetScalarType<T[P], AggregateRedirectRule[P]>
  }




  export type RedirectRuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RedirectRuleWhereInput
    orderBy?: RedirectRuleOrderByWithAggregationInput | RedirectRuleOrderByWithAggregationInput[]
    by: RedirectRuleScalarFieldEnum[] | RedirectRuleScalarFieldEnum
    having?: RedirectRuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RedirectRuleCountAggregateInputType | true
    _avg?: RedirectRuleAvgAggregateInputType
    _sum?: RedirectRuleSumAggregateInputType
    _min?: RedirectRuleMinAggregateInputType
    _max?: RedirectRuleMaxAggregateInputType
  }

  export type RedirectRuleGroupByOutputType = {
    id: string
    source: string
    destination: string
    statusCode: number
    matchMethod: $Enums.HttpMethod[]
    queryMatch: $Enums.RedirectQueryMatch
    pathMatch: $Enums.RedirectPathMatch
    linkMapId: string | null
    isBlocked: boolean
    blockedAt: Date | null
    priority: number
    domainGroupId: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: RedirectRuleCountAggregateOutputType | null
    _avg: RedirectRuleAvgAggregateOutputType | null
    _sum: RedirectRuleSumAggregateOutputType | null
    _min: RedirectRuleMinAggregateOutputType | null
    _max: RedirectRuleMaxAggregateOutputType | null
  }

  type GetRedirectRuleGroupByPayload<T extends RedirectRuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RedirectRuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RedirectRuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RedirectRuleGroupByOutputType[P]>
            : GetScalarType<T[P], RedirectRuleGroupByOutputType[P]>
        }
      >
    >


  export type RedirectRuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    destination?: boolean
    statusCode?: boolean
    matchMethod?: boolean
    queryMatch?: boolean
    pathMatch?: boolean
    linkMapId?: boolean
    isBlocked?: boolean
    blockedAt?: boolean
    priority?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
    linkMap?: boolean | RedirectRule$linkMapArgs<ExtArgs>
    hitsHourly?: boolean | RedirectRule$hitsHourlyArgs<ExtArgs>
    _count?: boolean | RedirectRuleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["redirectRule"]>

  export type RedirectRuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    destination?: boolean
    statusCode?: boolean
    matchMethod?: boolean
    queryMatch?: boolean
    pathMatch?: boolean
    linkMapId?: boolean
    isBlocked?: boolean
    blockedAt?: boolean
    priority?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
    linkMap?: boolean | RedirectRule$linkMapArgs<ExtArgs>
  }, ExtArgs["result"]["redirectRule"]>

  export type RedirectRuleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    destination?: boolean
    statusCode?: boolean
    matchMethod?: boolean
    queryMatch?: boolean
    pathMatch?: boolean
    linkMapId?: boolean
    isBlocked?: boolean
    blockedAt?: boolean
    priority?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
    linkMap?: boolean | RedirectRule$linkMapArgs<ExtArgs>
  }, ExtArgs["result"]["redirectRule"]>

  export type RedirectRuleSelectScalar = {
    id?: boolean
    source?: boolean
    destination?: boolean
    statusCode?: boolean
    matchMethod?: boolean
    queryMatch?: boolean
    pathMatch?: boolean
    linkMapId?: boolean
    isBlocked?: boolean
    blockedAt?: boolean
    priority?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type RedirectRuleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "source" | "destination" | "statusCode" | "matchMethod" | "queryMatch" | "pathMatch" | "linkMapId" | "isBlocked" | "blockedAt" | "priority" | "domainGroupId" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["redirectRule"]>
  export type RedirectRuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
    linkMap?: boolean | RedirectRule$linkMapArgs<ExtArgs>
    hitsHourly?: boolean | RedirectRule$hitsHourlyArgs<ExtArgs>
    _count?: boolean | RedirectRuleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RedirectRuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
    linkMap?: boolean | RedirectRule$linkMapArgs<ExtArgs>
  }
  export type RedirectRuleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
    linkMap?: boolean | RedirectRule$linkMapArgs<ExtArgs>
  }

  export type $RedirectRulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RedirectRule"
    objects: {
      domainGroup: Prisma.$DomainGroupPayload<ExtArgs>
      linkMap: Prisma.$LinkMapPayload<ExtArgs> | null
      hitsHourly: Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      source: string
      destination: string
      statusCode: number
      matchMethod: $Enums.HttpMethod[]
      queryMatch: $Enums.RedirectQueryMatch
      pathMatch: $Enums.RedirectPathMatch
      linkMapId: string | null
      isBlocked: boolean
      blockedAt: Date | null
      priority: number
      domainGroupId: string
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["redirectRule"]>
    composites: {}
  }

  type RedirectRuleGetPayload<S extends boolean | null | undefined | RedirectRuleDefaultArgs> = $Result.GetResult<Prisma.$RedirectRulePayload, S>

  type RedirectRuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RedirectRuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RedirectRuleCountAggregateInputType | true
    }

  export interface RedirectRuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RedirectRule'], meta: { name: 'RedirectRule' } }
    /**
     * Find zero or one RedirectRule that matches the filter.
     * @param {RedirectRuleFindUniqueArgs} args - Arguments to find a RedirectRule
     * @example
     * // Get one RedirectRule
     * const redirectRule = await prisma.redirectRule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RedirectRuleFindUniqueArgs>(args: SelectSubset<T, RedirectRuleFindUniqueArgs<ExtArgs>>): Prisma__RedirectRuleClient<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RedirectRule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RedirectRuleFindUniqueOrThrowArgs} args - Arguments to find a RedirectRule
     * @example
     * // Get one RedirectRule
     * const redirectRule = await prisma.redirectRule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RedirectRuleFindUniqueOrThrowArgs>(args: SelectSubset<T, RedirectRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RedirectRuleClient<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RedirectRule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleFindFirstArgs} args - Arguments to find a RedirectRule
     * @example
     * // Get one RedirectRule
     * const redirectRule = await prisma.redirectRule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RedirectRuleFindFirstArgs>(args?: SelectSubset<T, RedirectRuleFindFirstArgs<ExtArgs>>): Prisma__RedirectRuleClient<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RedirectRule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleFindFirstOrThrowArgs} args - Arguments to find a RedirectRule
     * @example
     * // Get one RedirectRule
     * const redirectRule = await prisma.redirectRule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RedirectRuleFindFirstOrThrowArgs>(args?: SelectSubset<T, RedirectRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__RedirectRuleClient<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RedirectRules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RedirectRules
     * const redirectRules = await prisma.redirectRule.findMany()
     * 
     * // Get first 10 RedirectRules
     * const redirectRules = await prisma.redirectRule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const redirectRuleWithIdOnly = await prisma.redirectRule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RedirectRuleFindManyArgs>(args?: SelectSubset<T, RedirectRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RedirectRule.
     * @param {RedirectRuleCreateArgs} args - Arguments to create a RedirectRule.
     * @example
     * // Create one RedirectRule
     * const RedirectRule = await prisma.redirectRule.create({
     *   data: {
     *     // ... data to create a RedirectRule
     *   }
     * })
     * 
     */
    create<T extends RedirectRuleCreateArgs>(args: SelectSubset<T, RedirectRuleCreateArgs<ExtArgs>>): Prisma__RedirectRuleClient<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RedirectRules.
     * @param {RedirectRuleCreateManyArgs} args - Arguments to create many RedirectRules.
     * @example
     * // Create many RedirectRules
     * const redirectRule = await prisma.redirectRule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RedirectRuleCreateManyArgs>(args?: SelectSubset<T, RedirectRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RedirectRules and returns the data saved in the database.
     * @param {RedirectRuleCreateManyAndReturnArgs} args - Arguments to create many RedirectRules.
     * @example
     * // Create many RedirectRules
     * const redirectRule = await prisma.redirectRule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RedirectRules and only return the `id`
     * const redirectRuleWithIdOnly = await prisma.redirectRule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RedirectRuleCreateManyAndReturnArgs>(args?: SelectSubset<T, RedirectRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RedirectRule.
     * @param {RedirectRuleDeleteArgs} args - Arguments to delete one RedirectRule.
     * @example
     * // Delete one RedirectRule
     * const RedirectRule = await prisma.redirectRule.delete({
     *   where: {
     *     // ... filter to delete one RedirectRule
     *   }
     * })
     * 
     */
    delete<T extends RedirectRuleDeleteArgs>(args: SelectSubset<T, RedirectRuleDeleteArgs<ExtArgs>>): Prisma__RedirectRuleClient<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RedirectRule.
     * @param {RedirectRuleUpdateArgs} args - Arguments to update one RedirectRule.
     * @example
     * // Update one RedirectRule
     * const redirectRule = await prisma.redirectRule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RedirectRuleUpdateArgs>(args: SelectSubset<T, RedirectRuleUpdateArgs<ExtArgs>>): Prisma__RedirectRuleClient<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RedirectRules.
     * @param {RedirectRuleDeleteManyArgs} args - Arguments to filter RedirectRules to delete.
     * @example
     * // Delete a few RedirectRules
     * const { count } = await prisma.redirectRule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RedirectRuleDeleteManyArgs>(args?: SelectSubset<T, RedirectRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RedirectRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RedirectRules
     * const redirectRule = await prisma.redirectRule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RedirectRuleUpdateManyArgs>(args: SelectSubset<T, RedirectRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RedirectRules and returns the data updated in the database.
     * @param {RedirectRuleUpdateManyAndReturnArgs} args - Arguments to update many RedirectRules.
     * @example
     * // Update many RedirectRules
     * const redirectRule = await prisma.redirectRule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RedirectRules and only return the `id`
     * const redirectRuleWithIdOnly = await prisma.redirectRule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RedirectRuleUpdateManyAndReturnArgs>(args: SelectSubset<T, RedirectRuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RedirectRule.
     * @param {RedirectRuleUpsertArgs} args - Arguments to update or create a RedirectRule.
     * @example
     * // Update or create a RedirectRule
     * const redirectRule = await prisma.redirectRule.upsert({
     *   create: {
     *     // ... data to create a RedirectRule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RedirectRule we want to update
     *   }
     * })
     */
    upsert<T extends RedirectRuleUpsertArgs>(args: SelectSubset<T, RedirectRuleUpsertArgs<ExtArgs>>): Prisma__RedirectRuleClient<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RedirectRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleCountArgs} args - Arguments to filter RedirectRules to count.
     * @example
     * // Count the number of RedirectRules
     * const count = await prisma.redirectRule.count({
     *   where: {
     *     // ... the filter for the RedirectRules we want to count
     *   }
     * })
    **/
    count<T extends RedirectRuleCountArgs>(
      args?: Subset<T, RedirectRuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RedirectRuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RedirectRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RedirectRuleAggregateArgs>(args: Subset<T, RedirectRuleAggregateArgs>): Prisma.PrismaPromise<GetRedirectRuleAggregateType<T>>

    /**
     * Group by RedirectRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RedirectRuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RedirectRuleGroupByArgs['orderBy'] }
        : { orderBy?: RedirectRuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RedirectRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRedirectRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RedirectRule model
   */
  readonly fields: RedirectRuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RedirectRule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RedirectRuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    domainGroup<T extends DomainGroupDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DomainGroupDefaultArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    linkMap<T extends RedirectRule$linkMapArgs<ExtArgs> = {}>(args?: Subset<T, RedirectRule$linkMapArgs<ExtArgs>>): Prisma__LinkMapClient<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    hitsHourly<T extends RedirectRule$hitsHourlyArgs<ExtArgs> = {}>(args?: Subset<T, RedirectRule$hitsHourlyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RedirectRule model
   */
  interface RedirectRuleFieldRefs {
    readonly id: FieldRef<"RedirectRule", 'String'>
    readonly source: FieldRef<"RedirectRule", 'String'>
    readonly destination: FieldRef<"RedirectRule", 'String'>
    readonly statusCode: FieldRef<"RedirectRule", 'Int'>
    readonly matchMethod: FieldRef<"RedirectRule", 'HttpMethod[]'>
    readonly queryMatch: FieldRef<"RedirectRule", 'RedirectQueryMatch'>
    readonly pathMatch: FieldRef<"RedirectRule", 'RedirectPathMatch'>
    readonly linkMapId: FieldRef<"RedirectRule", 'String'>
    readonly isBlocked: FieldRef<"RedirectRule", 'Boolean'>
    readonly blockedAt: FieldRef<"RedirectRule", 'DateTime'>
    readonly priority: FieldRef<"RedirectRule", 'Int'>
    readonly domainGroupId: FieldRef<"RedirectRule", 'String'>
    readonly createdAt: FieldRef<"RedirectRule", 'DateTime'>
    readonly updatedAt: FieldRef<"RedirectRule", 'DateTime'>
    readonly deletedAt: FieldRef<"RedirectRule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RedirectRule findUnique
   */
  export type RedirectRuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    /**
     * Filter, which RedirectRule to fetch.
     */
    where: RedirectRuleWhereUniqueInput
  }

  /**
   * RedirectRule findUniqueOrThrow
   */
  export type RedirectRuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    /**
     * Filter, which RedirectRule to fetch.
     */
    where: RedirectRuleWhereUniqueInput
  }

  /**
   * RedirectRule findFirst
   */
  export type RedirectRuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    /**
     * Filter, which RedirectRule to fetch.
     */
    where?: RedirectRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectRules to fetch.
     */
    orderBy?: RedirectRuleOrderByWithRelationInput | RedirectRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RedirectRules.
     */
    cursor?: RedirectRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RedirectRules.
     */
    distinct?: RedirectRuleScalarFieldEnum | RedirectRuleScalarFieldEnum[]
  }

  /**
   * RedirectRule findFirstOrThrow
   */
  export type RedirectRuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    /**
     * Filter, which RedirectRule to fetch.
     */
    where?: RedirectRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectRules to fetch.
     */
    orderBy?: RedirectRuleOrderByWithRelationInput | RedirectRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RedirectRules.
     */
    cursor?: RedirectRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RedirectRules.
     */
    distinct?: RedirectRuleScalarFieldEnum | RedirectRuleScalarFieldEnum[]
  }

  /**
   * RedirectRule findMany
   */
  export type RedirectRuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    /**
     * Filter, which RedirectRules to fetch.
     */
    where?: RedirectRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectRules to fetch.
     */
    orderBy?: RedirectRuleOrderByWithRelationInput | RedirectRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RedirectRules.
     */
    cursor?: RedirectRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectRules.
     */
    skip?: number
    distinct?: RedirectRuleScalarFieldEnum | RedirectRuleScalarFieldEnum[]
  }

  /**
   * RedirectRule create
   */
  export type RedirectRuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    /**
     * The data needed to create a RedirectRule.
     */
    data: XOR<RedirectRuleCreateInput, RedirectRuleUncheckedCreateInput>
  }

  /**
   * RedirectRule createMany
   */
  export type RedirectRuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RedirectRules.
     */
    data: RedirectRuleCreateManyInput | RedirectRuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RedirectRule createManyAndReturn
   */
  export type RedirectRuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * The data used to create many RedirectRules.
     */
    data: RedirectRuleCreateManyInput | RedirectRuleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RedirectRule update
   */
  export type RedirectRuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    /**
     * The data needed to update a RedirectRule.
     */
    data: XOR<RedirectRuleUpdateInput, RedirectRuleUncheckedUpdateInput>
    /**
     * Choose, which RedirectRule to update.
     */
    where: RedirectRuleWhereUniqueInput
  }

  /**
   * RedirectRule updateMany
   */
  export type RedirectRuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RedirectRules.
     */
    data: XOR<RedirectRuleUpdateManyMutationInput, RedirectRuleUncheckedUpdateManyInput>
    /**
     * Filter which RedirectRules to update
     */
    where?: RedirectRuleWhereInput
    /**
     * Limit how many RedirectRules to update.
     */
    limit?: number
  }

  /**
   * RedirectRule updateManyAndReturn
   */
  export type RedirectRuleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * The data used to update RedirectRules.
     */
    data: XOR<RedirectRuleUpdateManyMutationInput, RedirectRuleUncheckedUpdateManyInput>
    /**
     * Filter which RedirectRules to update
     */
    where?: RedirectRuleWhereInput
    /**
     * Limit how many RedirectRules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RedirectRule upsert
   */
  export type RedirectRuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    /**
     * The filter to search for the RedirectRule to update in case it exists.
     */
    where: RedirectRuleWhereUniqueInput
    /**
     * In case the RedirectRule found by the `where` argument doesn't exist, create a new RedirectRule with this data.
     */
    create: XOR<RedirectRuleCreateInput, RedirectRuleUncheckedCreateInput>
    /**
     * In case the RedirectRule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RedirectRuleUpdateInput, RedirectRuleUncheckedUpdateInput>
  }

  /**
   * RedirectRule delete
   */
  export type RedirectRuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    /**
     * Filter which RedirectRule to delete.
     */
    where: RedirectRuleWhereUniqueInput
  }

  /**
   * RedirectRule deleteMany
   */
  export type RedirectRuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RedirectRules to delete
     */
    where?: RedirectRuleWhereInput
    /**
     * Limit how many RedirectRules to delete.
     */
    limit?: number
  }

  /**
   * RedirectRule.linkMap
   */
  export type RedirectRule$linkMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    where?: LinkMapWhereInput
  }

  /**
   * RedirectRule.hitsHourly
   */
  export type RedirectRule$hitsHourlyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    where?: RedirectRuleHitsHourlyWhereInput
    orderBy?: RedirectRuleHitsHourlyOrderByWithRelationInput | RedirectRuleHitsHourlyOrderByWithRelationInput[]
    cursor?: RedirectRuleHitsHourlyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RedirectRuleHitsHourlyScalarFieldEnum | RedirectRuleHitsHourlyScalarFieldEnum[]
  }

  /**
   * RedirectRule without action
   */
  export type RedirectRuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
  }


  /**
   * Model LinkMap
   */

  export type AggregateLinkMap = {
    _count: LinkMapCountAggregateOutputType | null
    _min: LinkMapMinAggregateOutputType | null
    _max: LinkMapMaxAggregateOutputType | null
  }

  export type LinkMapMinAggregateOutputType = {
    id: string | null
    name: string | null
    domainGroupId: string | null
    caseSensitive: boolean | null
    queryMatch: $Enums.RedirectQueryMatch | null
    fallbackDestination: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type LinkMapMaxAggregateOutputType = {
    id: string | null
    name: string | null
    domainGroupId: string | null
    caseSensitive: boolean | null
    queryMatch: $Enums.RedirectQueryMatch | null
    fallbackDestination: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type LinkMapCountAggregateOutputType = {
    id: number
    name: number
    domainGroupId: number
    caseSensitive: number
    queryMatch: number
    fallbackDestination: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type LinkMapMinAggregateInputType = {
    id?: true
    name?: true
    domainGroupId?: true
    caseSensitive?: true
    queryMatch?: true
    fallbackDestination?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type LinkMapMaxAggregateInputType = {
    id?: true
    name?: true
    domainGroupId?: true
    caseSensitive?: true
    queryMatch?: true
    fallbackDestination?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type LinkMapCountAggregateInputType = {
    id?: true
    name?: true
    domainGroupId?: true
    caseSensitive?: true
    queryMatch?: true
    fallbackDestination?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type LinkMapAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LinkMap to aggregate.
     */
    where?: LinkMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkMaps to fetch.
     */
    orderBy?: LinkMapOrderByWithRelationInput | LinkMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LinkMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LinkMaps
    **/
    _count?: true | LinkMapCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LinkMapMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LinkMapMaxAggregateInputType
  }

  export type GetLinkMapAggregateType<T extends LinkMapAggregateArgs> = {
        [P in keyof T & keyof AggregateLinkMap]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLinkMap[P]>
      : GetScalarType<T[P], AggregateLinkMap[P]>
  }




  export type LinkMapGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LinkMapWhereInput
    orderBy?: LinkMapOrderByWithAggregationInput | LinkMapOrderByWithAggregationInput[]
    by: LinkMapScalarFieldEnum[] | LinkMapScalarFieldEnum
    having?: LinkMapScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LinkMapCountAggregateInputType | true
    _min?: LinkMapMinAggregateInputType
    _max?: LinkMapMaxAggregateInputType
  }

  export type LinkMapGroupByOutputType = {
    id: string
    name: string
    domainGroupId: string
    caseSensitive: boolean
    queryMatch: $Enums.RedirectQueryMatch
    fallbackDestination: string | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: LinkMapCountAggregateOutputType | null
    _min: LinkMapMinAggregateOutputType | null
    _max: LinkMapMaxAggregateOutputType | null
  }

  type GetLinkMapGroupByPayload<T extends LinkMapGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LinkMapGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LinkMapGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LinkMapGroupByOutputType[P]>
            : GetScalarType<T[P], LinkMapGroupByOutputType[P]>
        }
      >
    >


  export type LinkMapSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    domainGroupId?: boolean
    caseSensitive?: boolean
    queryMatch?: boolean
    fallbackDestination?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
    entries?: boolean | LinkMap$entriesArgs<ExtArgs>
    redirectRules?: boolean | LinkMap$redirectRulesArgs<ExtArgs>
    _count?: boolean | LinkMapCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["linkMap"]>

  export type LinkMapSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    domainGroupId?: boolean
    caseSensitive?: boolean
    queryMatch?: boolean
    fallbackDestination?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["linkMap"]>

  export type LinkMapSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    domainGroupId?: boolean
    caseSensitive?: boolean
    queryMatch?: boolean
    fallbackDestination?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["linkMap"]>

  export type LinkMapSelectScalar = {
    id?: boolean
    name?: boolean
    domainGroupId?: boolean
    caseSensitive?: boolean
    queryMatch?: boolean
    fallbackDestination?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type LinkMapOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "domainGroupId" | "caseSensitive" | "queryMatch" | "fallbackDestination" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["linkMap"]>
  export type LinkMapInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
    entries?: boolean | LinkMap$entriesArgs<ExtArgs>
    redirectRules?: boolean | LinkMap$redirectRulesArgs<ExtArgs>
    _count?: boolean | LinkMapCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type LinkMapIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }
  export type LinkMapIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }

  export type $LinkMapPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LinkMap"
    objects: {
      domainGroup: Prisma.$DomainGroupPayload<ExtArgs>
      entries: Prisma.$LinkMapEntryPayload<ExtArgs>[]
      redirectRules: Prisma.$RedirectRulePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      domainGroupId: string
      caseSensitive: boolean
      queryMatch: $Enums.RedirectQueryMatch
      fallbackDestination: string | null
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["linkMap"]>
    composites: {}
  }

  type LinkMapGetPayload<S extends boolean | null | undefined | LinkMapDefaultArgs> = $Result.GetResult<Prisma.$LinkMapPayload, S>

  type LinkMapCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LinkMapFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LinkMapCountAggregateInputType | true
    }

  export interface LinkMapDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LinkMap'], meta: { name: 'LinkMap' } }
    /**
     * Find zero or one LinkMap that matches the filter.
     * @param {LinkMapFindUniqueArgs} args - Arguments to find a LinkMap
     * @example
     * // Get one LinkMap
     * const linkMap = await prisma.linkMap.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LinkMapFindUniqueArgs>(args: SelectSubset<T, LinkMapFindUniqueArgs<ExtArgs>>): Prisma__LinkMapClient<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LinkMap that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LinkMapFindUniqueOrThrowArgs} args - Arguments to find a LinkMap
     * @example
     * // Get one LinkMap
     * const linkMap = await prisma.linkMap.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LinkMapFindUniqueOrThrowArgs>(args: SelectSubset<T, LinkMapFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LinkMapClient<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LinkMap that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapFindFirstArgs} args - Arguments to find a LinkMap
     * @example
     * // Get one LinkMap
     * const linkMap = await prisma.linkMap.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LinkMapFindFirstArgs>(args?: SelectSubset<T, LinkMapFindFirstArgs<ExtArgs>>): Prisma__LinkMapClient<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LinkMap that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapFindFirstOrThrowArgs} args - Arguments to find a LinkMap
     * @example
     * // Get one LinkMap
     * const linkMap = await prisma.linkMap.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LinkMapFindFirstOrThrowArgs>(args?: SelectSubset<T, LinkMapFindFirstOrThrowArgs<ExtArgs>>): Prisma__LinkMapClient<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LinkMaps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LinkMaps
     * const linkMaps = await prisma.linkMap.findMany()
     * 
     * // Get first 10 LinkMaps
     * const linkMaps = await prisma.linkMap.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const linkMapWithIdOnly = await prisma.linkMap.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LinkMapFindManyArgs>(args?: SelectSubset<T, LinkMapFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LinkMap.
     * @param {LinkMapCreateArgs} args - Arguments to create a LinkMap.
     * @example
     * // Create one LinkMap
     * const LinkMap = await prisma.linkMap.create({
     *   data: {
     *     // ... data to create a LinkMap
     *   }
     * })
     * 
     */
    create<T extends LinkMapCreateArgs>(args: SelectSubset<T, LinkMapCreateArgs<ExtArgs>>): Prisma__LinkMapClient<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LinkMaps.
     * @param {LinkMapCreateManyArgs} args - Arguments to create many LinkMaps.
     * @example
     * // Create many LinkMaps
     * const linkMap = await prisma.linkMap.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LinkMapCreateManyArgs>(args?: SelectSubset<T, LinkMapCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LinkMaps and returns the data saved in the database.
     * @param {LinkMapCreateManyAndReturnArgs} args - Arguments to create many LinkMaps.
     * @example
     * // Create many LinkMaps
     * const linkMap = await prisma.linkMap.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LinkMaps and only return the `id`
     * const linkMapWithIdOnly = await prisma.linkMap.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LinkMapCreateManyAndReturnArgs>(args?: SelectSubset<T, LinkMapCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LinkMap.
     * @param {LinkMapDeleteArgs} args - Arguments to delete one LinkMap.
     * @example
     * // Delete one LinkMap
     * const LinkMap = await prisma.linkMap.delete({
     *   where: {
     *     // ... filter to delete one LinkMap
     *   }
     * })
     * 
     */
    delete<T extends LinkMapDeleteArgs>(args: SelectSubset<T, LinkMapDeleteArgs<ExtArgs>>): Prisma__LinkMapClient<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LinkMap.
     * @param {LinkMapUpdateArgs} args - Arguments to update one LinkMap.
     * @example
     * // Update one LinkMap
     * const linkMap = await prisma.linkMap.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LinkMapUpdateArgs>(args: SelectSubset<T, LinkMapUpdateArgs<ExtArgs>>): Prisma__LinkMapClient<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LinkMaps.
     * @param {LinkMapDeleteManyArgs} args - Arguments to filter LinkMaps to delete.
     * @example
     * // Delete a few LinkMaps
     * const { count } = await prisma.linkMap.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LinkMapDeleteManyArgs>(args?: SelectSubset<T, LinkMapDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LinkMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LinkMaps
     * const linkMap = await prisma.linkMap.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LinkMapUpdateManyArgs>(args: SelectSubset<T, LinkMapUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LinkMaps and returns the data updated in the database.
     * @param {LinkMapUpdateManyAndReturnArgs} args - Arguments to update many LinkMaps.
     * @example
     * // Update many LinkMaps
     * const linkMap = await prisma.linkMap.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LinkMaps and only return the `id`
     * const linkMapWithIdOnly = await prisma.linkMap.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LinkMapUpdateManyAndReturnArgs>(args: SelectSubset<T, LinkMapUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LinkMap.
     * @param {LinkMapUpsertArgs} args - Arguments to update or create a LinkMap.
     * @example
     * // Update or create a LinkMap
     * const linkMap = await prisma.linkMap.upsert({
     *   create: {
     *     // ... data to create a LinkMap
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LinkMap we want to update
     *   }
     * })
     */
    upsert<T extends LinkMapUpsertArgs>(args: SelectSubset<T, LinkMapUpsertArgs<ExtArgs>>): Prisma__LinkMapClient<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LinkMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapCountArgs} args - Arguments to filter LinkMaps to count.
     * @example
     * // Count the number of LinkMaps
     * const count = await prisma.linkMap.count({
     *   where: {
     *     // ... the filter for the LinkMaps we want to count
     *   }
     * })
    **/
    count<T extends LinkMapCountArgs>(
      args?: Subset<T, LinkMapCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LinkMapCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LinkMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LinkMapAggregateArgs>(args: Subset<T, LinkMapAggregateArgs>): Prisma.PrismaPromise<GetLinkMapAggregateType<T>>

    /**
     * Group by LinkMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LinkMapGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LinkMapGroupByArgs['orderBy'] }
        : { orderBy?: LinkMapGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LinkMapGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLinkMapGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LinkMap model
   */
  readonly fields: LinkMapFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LinkMap.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LinkMapClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    domainGroup<T extends DomainGroupDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DomainGroupDefaultArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    entries<T extends LinkMap$entriesArgs<ExtArgs> = {}>(args?: Subset<T, LinkMap$entriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    redirectRules<T extends LinkMap$redirectRulesArgs<ExtArgs> = {}>(args?: Subset<T, LinkMap$redirectRulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LinkMap model
   */
  interface LinkMapFieldRefs {
    readonly id: FieldRef<"LinkMap", 'String'>
    readonly name: FieldRef<"LinkMap", 'String'>
    readonly domainGroupId: FieldRef<"LinkMap", 'String'>
    readonly caseSensitive: FieldRef<"LinkMap", 'Boolean'>
    readonly queryMatch: FieldRef<"LinkMap", 'RedirectQueryMatch'>
    readonly fallbackDestination: FieldRef<"LinkMap", 'String'>
    readonly createdAt: FieldRef<"LinkMap", 'DateTime'>
    readonly updatedAt: FieldRef<"LinkMap", 'DateTime'>
    readonly deletedAt: FieldRef<"LinkMap", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LinkMap findUnique
   */
  export type LinkMapFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    /**
     * Filter, which LinkMap to fetch.
     */
    where: LinkMapWhereUniqueInput
  }

  /**
   * LinkMap findUniqueOrThrow
   */
  export type LinkMapFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    /**
     * Filter, which LinkMap to fetch.
     */
    where: LinkMapWhereUniqueInput
  }

  /**
   * LinkMap findFirst
   */
  export type LinkMapFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    /**
     * Filter, which LinkMap to fetch.
     */
    where?: LinkMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkMaps to fetch.
     */
    orderBy?: LinkMapOrderByWithRelationInput | LinkMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LinkMaps.
     */
    cursor?: LinkMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LinkMaps.
     */
    distinct?: LinkMapScalarFieldEnum | LinkMapScalarFieldEnum[]
  }

  /**
   * LinkMap findFirstOrThrow
   */
  export type LinkMapFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    /**
     * Filter, which LinkMap to fetch.
     */
    where?: LinkMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkMaps to fetch.
     */
    orderBy?: LinkMapOrderByWithRelationInput | LinkMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LinkMaps.
     */
    cursor?: LinkMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LinkMaps.
     */
    distinct?: LinkMapScalarFieldEnum | LinkMapScalarFieldEnum[]
  }

  /**
   * LinkMap findMany
   */
  export type LinkMapFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    /**
     * Filter, which LinkMaps to fetch.
     */
    where?: LinkMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkMaps to fetch.
     */
    orderBy?: LinkMapOrderByWithRelationInput | LinkMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LinkMaps.
     */
    cursor?: LinkMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkMaps.
     */
    skip?: number
    distinct?: LinkMapScalarFieldEnum | LinkMapScalarFieldEnum[]
  }

  /**
   * LinkMap create
   */
  export type LinkMapCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    /**
     * The data needed to create a LinkMap.
     */
    data: XOR<LinkMapCreateInput, LinkMapUncheckedCreateInput>
  }

  /**
   * LinkMap createMany
   */
  export type LinkMapCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LinkMaps.
     */
    data: LinkMapCreateManyInput | LinkMapCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LinkMap createManyAndReturn
   */
  export type LinkMapCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * The data used to create many LinkMaps.
     */
    data: LinkMapCreateManyInput | LinkMapCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LinkMap update
   */
  export type LinkMapUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    /**
     * The data needed to update a LinkMap.
     */
    data: XOR<LinkMapUpdateInput, LinkMapUncheckedUpdateInput>
    /**
     * Choose, which LinkMap to update.
     */
    where: LinkMapWhereUniqueInput
  }

  /**
   * LinkMap updateMany
   */
  export type LinkMapUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LinkMaps.
     */
    data: XOR<LinkMapUpdateManyMutationInput, LinkMapUncheckedUpdateManyInput>
    /**
     * Filter which LinkMaps to update
     */
    where?: LinkMapWhereInput
    /**
     * Limit how many LinkMaps to update.
     */
    limit?: number
  }

  /**
   * LinkMap updateManyAndReturn
   */
  export type LinkMapUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * The data used to update LinkMaps.
     */
    data: XOR<LinkMapUpdateManyMutationInput, LinkMapUncheckedUpdateManyInput>
    /**
     * Filter which LinkMaps to update
     */
    where?: LinkMapWhereInput
    /**
     * Limit how many LinkMaps to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LinkMap upsert
   */
  export type LinkMapUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    /**
     * The filter to search for the LinkMap to update in case it exists.
     */
    where: LinkMapWhereUniqueInput
    /**
     * In case the LinkMap found by the `where` argument doesn't exist, create a new LinkMap with this data.
     */
    create: XOR<LinkMapCreateInput, LinkMapUncheckedCreateInput>
    /**
     * In case the LinkMap was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LinkMapUpdateInput, LinkMapUncheckedUpdateInput>
  }

  /**
   * LinkMap delete
   */
  export type LinkMapDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
    /**
     * Filter which LinkMap to delete.
     */
    where: LinkMapWhereUniqueInput
  }

  /**
   * LinkMap deleteMany
   */
  export type LinkMapDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LinkMaps to delete
     */
    where?: LinkMapWhereInput
    /**
     * Limit how many LinkMaps to delete.
     */
    limit?: number
  }

  /**
   * LinkMap.entries
   */
  export type LinkMap$entriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
    where?: LinkMapEntryWhereInput
    orderBy?: LinkMapEntryOrderByWithRelationInput | LinkMapEntryOrderByWithRelationInput[]
    cursor?: LinkMapEntryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LinkMapEntryScalarFieldEnum | LinkMapEntryScalarFieldEnum[]
  }

  /**
   * LinkMap.redirectRules
   */
  export type LinkMap$redirectRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRule
     */
    select?: RedirectRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRule
     */
    omit?: RedirectRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleInclude<ExtArgs> | null
    where?: RedirectRuleWhereInput
    orderBy?: RedirectRuleOrderByWithRelationInput | RedirectRuleOrderByWithRelationInput[]
    cursor?: RedirectRuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RedirectRuleScalarFieldEnum | RedirectRuleScalarFieldEnum[]
  }

  /**
   * LinkMap without action
   */
  export type LinkMapDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMap
     */
    select?: LinkMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMap
     */
    omit?: LinkMapOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapInclude<ExtArgs> | null
  }


  /**
   * Model LinkMapEntry
   */

  export type AggregateLinkMapEntry = {
    _count: LinkMapEntryCountAggregateOutputType | null
    _min: LinkMapEntryMinAggregateOutputType | null
    _max: LinkMapEntryMaxAggregateOutputType | null
  }

  export type LinkMapEntryMinAggregateOutputType = {
    id: string | null
    linkMapId: string | null
    key: string | null
    keyNormalized: string | null
    destination: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type LinkMapEntryMaxAggregateOutputType = {
    id: string | null
    linkMapId: string | null
    key: string | null
    keyNormalized: string | null
    destination: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type LinkMapEntryCountAggregateOutputType = {
    id: number
    linkMapId: number
    key: number
    keyNormalized: number
    destination: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type LinkMapEntryMinAggregateInputType = {
    id?: true
    linkMapId?: true
    key?: true
    keyNormalized?: true
    destination?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type LinkMapEntryMaxAggregateInputType = {
    id?: true
    linkMapId?: true
    key?: true
    keyNormalized?: true
    destination?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type LinkMapEntryCountAggregateInputType = {
    id?: true
    linkMapId?: true
    key?: true
    keyNormalized?: true
    destination?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type LinkMapEntryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LinkMapEntry to aggregate.
     */
    where?: LinkMapEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkMapEntries to fetch.
     */
    orderBy?: LinkMapEntryOrderByWithRelationInput | LinkMapEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LinkMapEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkMapEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkMapEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LinkMapEntries
    **/
    _count?: true | LinkMapEntryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LinkMapEntryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LinkMapEntryMaxAggregateInputType
  }

  export type GetLinkMapEntryAggregateType<T extends LinkMapEntryAggregateArgs> = {
        [P in keyof T & keyof AggregateLinkMapEntry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLinkMapEntry[P]>
      : GetScalarType<T[P], AggregateLinkMapEntry[P]>
  }




  export type LinkMapEntryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LinkMapEntryWhereInput
    orderBy?: LinkMapEntryOrderByWithAggregationInput | LinkMapEntryOrderByWithAggregationInput[]
    by: LinkMapEntryScalarFieldEnum[] | LinkMapEntryScalarFieldEnum
    having?: LinkMapEntryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LinkMapEntryCountAggregateInputType | true
    _min?: LinkMapEntryMinAggregateInputType
    _max?: LinkMapEntryMaxAggregateInputType
  }

  export type LinkMapEntryGroupByOutputType = {
    id: string
    linkMapId: string
    key: string
    keyNormalized: string
    destination: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: LinkMapEntryCountAggregateOutputType | null
    _min: LinkMapEntryMinAggregateOutputType | null
    _max: LinkMapEntryMaxAggregateOutputType | null
  }

  type GetLinkMapEntryGroupByPayload<T extends LinkMapEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LinkMapEntryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LinkMapEntryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LinkMapEntryGroupByOutputType[P]>
            : GetScalarType<T[P], LinkMapEntryGroupByOutputType[P]>
        }
      >
    >


  export type LinkMapEntrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    linkMapId?: boolean
    key?: boolean
    keyNormalized?: boolean
    destination?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    linkMap?: boolean | LinkMapDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["linkMapEntry"]>

  export type LinkMapEntrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    linkMapId?: boolean
    key?: boolean
    keyNormalized?: boolean
    destination?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    linkMap?: boolean | LinkMapDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["linkMapEntry"]>

  export type LinkMapEntrySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    linkMapId?: boolean
    key?: boolean
    keyNormalized?: boolean
    destination?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    linkMap?: boolean | LinkMapDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["linkMapEntry"]>

  export type LinkMapEntrySelectScalar = {
    id?: boolean
    linkMapId?: boolean
    key?: boolean
    keyNormalized?: boolean
    destination?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type LinkMapEntryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "linkMapId" | "key" | "keyNormalized" | "destination" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["linkMapEntry"]>
  export type LinkMapEntryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    linkMap?: boolean | LinkMapDefaultArgs<ExtArgs>
  }
  export type LinkMapEntryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    linkMap?: boolean | LinkMapDefaultArgs<ExtArgs>
  }
  export type LinkMapEntryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    linkMap?: boolean | LinkMapDefaultArgs<ExtArgs>
  }

  export type $LinkMapEntryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LinkMapEntry"
    objects: {
      linkMap: Prisma.$LinkMapPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      linkMapId: string
      key: string
      keyNormalized: string
      destination: string
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["linkMapEntry"]>
    composites: {}
  }

  type LinkMapEntryGetPayload<S extends boolean | null | undefined | LinkMapEntryDefaultArgs> = $Result.GetResult<Prisma.$LinkMapEntryPayload, S>

  type LinkMapEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LinkMapEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LinkMapEntryCountAggregateInputType | true
    }

  export interface LinkMapEntryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LinkMapEntry'], meta: { name: 'LinkMapEntry' } }
    /**
     * Find zero or one LinkMapEntry that matches the filter.
     * @param {LinkMapEntryFindUniqueArgs} args - Arguments to find a LinkMapEntry
     * @example
     * // Get one LinkMapEntry
     * const linkMapEntry = await prisma.linkMapEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LinkMapEntryFindUniqueArgs>(args: SelectSubset<T, LinkMapEntryFindUniqueArgs<ExtArgs>>): Prisma__LinkMapEntryClient<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LinkMapEntry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LinkMapEntryFindUniqueOrThrowArgs} args - Arguments to find a LinkMapEntry
     * @example
     * // Get one LinkMapEntry
     * const linkMapEntry = await prisma.linkMapEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LinkMapEntryFindUniqueOrThrowArgs>(args: SelectSubset<T, LinkMapEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LinkMapEntryClient<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LinkMapEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapEntryFindFirstArgs} args - Arguments to find a LinkMapEntry
     * @example
     * // Get one LinkMapEntry
     * const linkMapEntry = await prisma.linkMapEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LinkMapEntryFindFirstArgs>(args?: SelectSubset<T, LinkMapEntryFindFirstArgs<ExtArgs>>): Prisma__LinkMapEntryClient<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LinkMapEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapEntryFindFirstOrThrowArgs} args - Arguments to find a LinkMapEntry
     * @example
     * // Get one LinkMapEntry
     * const linkMapEntry = await prisma.linkMapEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LinkMapEntryFindFirstOrThrowArgs>(args?: SelectSubset<T, LinkMapEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma__LinkMapEntryClient<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LinkMapEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LinkMapEntries
     * const linkMapEntries = await prisma.linkMapEntry.findMany()
     * 
     * // Get first 10 LinkMapEntries
     * const linkMapEntries = await prisma.linkMapEntry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const linkMapEntryWithIdOnly = await prisma.linkMapEntry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LinkMapEntryFindManyArgs>(args?: SelectSubset<T, LinkMapEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LinkMapEntry.
     * @param {LinkMapEntryCreateArgs} args - Arguments to create a LinkMapEntry.
     * @example
     * // Create one LinkMapEntry
     * const LinkMapEntry = await prisma.linkMapEntry.create({
     *   data: {
     *     // ... data to create a LinkMapEntry
     *   }
     * })
     * 
     */
    create<T extends LinkMapEntryCreateArgs>(args: SelectSubset<T, LinkMapEntryCreateArgs<ExtArgs>>): Prisma__LinkMapEntryClient<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LinkMapEntries.
     * @param {LinkMapEntryCreateManyArgs} args - Arguments to create many LinkMapEntries.
     * @example
     * // Create many LinkMapEntries
     * const linkMapEntry = await prisma.linkMapEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LinkMapEntryCreateManyArgs>(args?: SelectSubset<T, LinkMapEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LinkMapEntries and returns the data saved in the database.
     * @param {LinkMapEntryCreateManyAndReturnArgs} args - Arguments to create many LinkMapEntries.
     * @example
     * // Create many LinkMapEntries
     * const linkMapEntry = await prisma.linkMapEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LinkMapEntries and only return the `id`
     * const linkMapEntryWithIdOnly = await prisma.linkMapEntry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LinkMapEntryCreateManyAndReturnArgs>(args?: SelectSubset<T, LinkMapEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LinkMapEntry.
     * @param {LinkMapEntryDeleteArgs} args - Arguments to delete one LinkMapEntry.
     * @example
     * // Delete one LinkMapEntry
     * const LinkMapEntry = await prisma.linkMapEntry.delete({
     *   where: {
     *     // ... filter to delete one LinkMapEntry
     *   }
     * })
     * 
     */
    delete<T extends LinkMapEntryDeleteArgs>(args: SelectSubset<T, LinkMapEntryDeleteArgs<ExtArgs>>): Prisma__LinkMapEntryClient<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LinkMapEntry.
     * @param {LinkMapEntryUpdateArgs} args - Arguments to update one LinkMapEntry.
     * @example
     * // Update one LinkMapEntry
     * const linkMapEntry = await prisma.linkMapEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LinkMapEntryUpdateArgs>(args: SelectSubset<T, LinkMapEntryUpdateArgs<ExtArgs>>): Prisma__LinkMapEntryClient<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LinkMapEntries.
     * @param {LinkMapEntryDeleteManyArgs} args - Arguments to filter LinkMapEntries to delete.
     * @example
     * // Delete a few LinkMapEntries
     * const { count } = await prisma.linkMapEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LinkMapEntryDeleteManyArgs>(args?: SelectSubset<T, LinkMapEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LinkMapEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LinkMapEntries
     * const linkMapEntry = await prisma.linkMapEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LinkMapEntryUpdateManyArgs>(args: SelectSubset<T, LinkMapEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LinkMapEntries and returns the data updated in the database.
     * @param {LinkMapEntryUpdateManyAndReturnArgs} args - Arguments to update many LinkMapEntries.
     * @example
     * // Update many LinkMapEntries
     * const linkMapEntry = await prisma.linkMapEntry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LinkMapEntries and only return the `id`
     * const linkMapEntryWithIdOnly = await prisma.linkMapEntry.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LinkMapEntryUpdateManyAndReturnArgs>(args: SelectSubset<T, LinkMapEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LinkMapEntry.
     * @param {LinkMapEntryUpsertArgs} args - Arguments to update or create a LinkMapEntry.
     * @example
     * // Update or create a LinkMapEntry
     * const linkMapEntry = await prisma.linkMapEntry.upsert({
     *   create: {
     *     // ... data to create a LinkMapEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LinkMapEntry we want to update
     *   }
     * })
     */
    upsert<T extends LinkMapEntryUpsertArgs>(args: SelectSubset<T, LinkMapEntryUpsertArgs<ExtArgs>>): Prisma__LinkMapEntryClient<$Result.GetResult<Prisma.$LinkMapEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LinkMapEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapEntryCountArgs} args - Arguments to filter LinkMapEntries to count.
     * @example
     * // Count the number of LinkMapEntries
     * const count = await prisma.linkMapEntry.count({
     *   where: {
     *     // ... the filter for the LinkMapEntries we want to count
     *   }
     * })
    **/
    count<T extends LinkMapEntryCountArgs>(
      args?: Subset<T, LinkMapEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LinkMapEntryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LinkMapEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LinkMapEntryAggregateArgs>(args: Subset<T, LinkMapEntryAggregateArgs>): Prisma.PrismaPromise<GetLinkMapEntryAggregateType<T>>

    /**
     * Group by LinkMapEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkMapEntryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LinkMapEntryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LinkMapEntryGroupByArgs['orderBy'] }
        : { orderBy?: LinkMapEntryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LinkMapEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLinkMapEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LinkMapEntry model
   */
  readonly fields: LinkMapEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LinkMapEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LinkMapEntryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    linkMap<T extends LinkMapDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LinkMapDefaultArgs<ExtArgs>>): Prisma__LinkMapClient<$Result.GetResult<Prisma.$LinkMapPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LinkMapEntry model
   */
  interface LinkMapEntryFieldRefs {
    readonly id: FieldRef<"LinkMapEntry", 'String'>
    readonly linkMapId: FieldRef<"LinkMapEntry", 'String'>
    readonly key: FieldRef<"LinkMapEntry", 'String'>
    readonly keyNormalized: FieldRef<"LinkMapEntry", 'String'>
    readonly destination: FieldRef<"LinkMapEntry", 'String'>
    readonly createdAt: FieldRef<"LinkMapEntry", 'DateTime'>
    readonly updatedAt: FieldRef<"LinkMapEntry", 'DateTime'>
    readonly deletedAt: FieldRef<"LinkMapEntry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LinkMapEntry findUnique
   */
  export type LinkMapEntryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
    /**
     * Filter, which LinkMapEntry to fetch.
     */
    where: LinkMapEntryWhereUniqueInput
  }

  /**
   * LinkMapEntry findUniqueOrThrow
   */
  export type LinkMapEntryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
    /**
     * Filter, which LinkMapEntry to fetch.
     */
    where: LinkMapEntryWhereUniqueInput
  }

  /**
   * LinkMapEntry findFirst
   */
  export type LinkMapEntryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
    /**
     * Filter, which LinkMapEntry to fetch.
     */
    where?: LinkMapEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkMapEntries to fetch.
     */
    orderBy?: LinkMapEntryOrderByWithRelationInput | LinkMapEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LinkMapEntries.
     */
    cursor?: LinkMapEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkMapEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkMapEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LinkMapEntries.
     */
    distinct?: LinkMapEntryScalarFieldEnum | LinkMapEntryScalarFieldEnum[]
  }

  /**
   * LinkMapEntry findFirstOrThrow
   */
  export type LinkMapEntryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
    /**
     * Filter, which LinkMapEntry to fetch.
     */
    where?: LinkMapEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkMapEntries to fetch.
     */
    orderBy?: LinkMapEntryOrderByWithRelationInput | LinkMapEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LinkMapEntries.
     */
    cursor?: LinkMapEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkMapEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkMapEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LinkMapEntries.
     */
    distinct?: LinkMapEntryScalarFieldEnum | LinkMapEntryScalarFieldEnum[]
  }

  /**
   * LinkMapEntry findMany
   */
  export type LinkMapEntryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
    /**
     * Filter, which LinkMapEntries to fetch.
     */
    where?: LinkMapEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkMapEntries to fetch.
     */
    orderBy?: LinkMapEntryOrderByWithRelationInput | LinkMapEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LinkMapEntries.
     */
    cursor?: LinkMapEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkMapEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkMapEntries.
     */
    skip?: number
    distinct?: LinkMapEntryScalarFieldEnum | LinkMapEntryScalarFieldEnum[]
  }

  /**
   * LinkMapEntry create
   */
  export type LinkMapEntryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
    /**
     * The data needed to create a LinkMapEntry.
     */
    data: XOR<LinkMapEntryCreateInput, LinkMapEntryUncheckedCreateInput>
  }

  /**
   * LinkMapEntry createMany
   */
  export type LinkMapEntryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LinkMapEntries.
     */
    data: LinkMapEntryCreateManyInput | LinkMapEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LinkMapEntry createManyAndReturn
   */
  export type LinkMapEntryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * The data used to create many LinkMapEntries.
     */
    data: LinkMapEntryCreateManyInput | LinkMapEntryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LinkMapEntry update
   */
  export type LinkMapEntryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
    /**
     * The data needed to update a LinkMapEntry.
     */
    data: XOR<LinkMapEntryUpdateInput, LinkMapEntryUncheckedUpdateInput>
    /**
     * Choose, which LinkMapEntry to update.
     */
    where: LinkMapEntryWhereUniqueInput
  }

  /**
   * LinkMapEntry updateMany
   */
  export type LinkMapEntryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LinkMapEntries.
     */
    data: XOR<LinkMapEntryUpdateManyMutationInput, LinkMapEntryUncheckedUpdateManyInput>
    /**
     * Filter which LinkMapEntries to update
     */
    where?: LinkMapEntryWhereInput
    /**
     * Limit how many LinkMapEntries to update.
     */
    limit?: number
  }

  /**
   * LinkMapEntry updateManyAndReturn
   */
  export type LinkMapEntryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * The data used to update LinkMapEntries.
     */
    data: XOR<LinkMapEntryUpdateManyMutationInput, LinkMapEntryUncheckedUpdateManyInput>
    /**
     * Filter which LinkMapEntries to update
     */
    where?: LinkMapEntryWhereInput
    /**
     * Limit how many LinkMapEntries to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LinkMapEntry upsert
   */
  export type LinkMapEntryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
    /**
     * The filter to search for the LinkMapEntry to update in case it exists.
     */
    where: LinkMapEntryWhereUniqueInput
    /**
     * In case the LinkMapEntry found by the `where` argument doesn't exist, create a new LinkMapEntry with this data.
     */
    create: XOR<LinkMapEntryCreateInput, LinkMapEntryUncheckedCreateInput>
    /**
     * In case the LinkMapEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LinkMapEntryUpdateInput, LinkMapEntryUncheckedUpdateInput>
  }

  /**
   * LinkMapEntry delete
   */
  export type LinkMapEntryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
    /**
     * Filter which LinkMapEntry to delete.
     */
    where: LinkMapEntryWhereUniqueInput
  }

  /**
   * LinkMapEntry deleteMany
   */
  export type LinkMapEntryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LinkMapEntries to delete
     */
    where?: LinkMapEntryWhereInput
    /**
     * Limit how many LinkMapEntries to delete.
     */
    limit?: number
  }

  /**
   * LinkMapEntry without action
   */
  export type LinkMapEntryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkMapEntry
     */
    select?: LinkMapEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkMapEntry
     */
    omit?: LinkMapEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkMapEntryInclude<ExtArgs> | null
  }


  /**
   * Model RedirectRuleHitsHourly
   */

  export type AggregateRedirectRuleHitsHourly = {
    _count: RedirectRuleHitsHourlyCountAggregateOutputType | null
    _avg: RedirectRuleHitsHourlyAvgAggregateOutputType | null
    _sum: RedirectRuleHitsHourlySumAggregateOutputType | null
    _min: RedirectRuleHitsHourlyMinAggregateOutputType | null
    _max: RedirectRuleHitsHourlyMaxAggregateOutputType | null
  }

  export type RedirectRuleHitsHourlyAvgAggregateOutputType = {
    hits: number | null
  }

  export type RedirectRuleHitsHourlySumAggregateOutputType = {
    hits: number | null
  }

  export type RedirectRuleHitsHourlyMinAggregateOutputType = {
    ruleId: string | null
    organizationId: string | null
    bucketStart: Date | null
    hits: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RedirectRuleHitsHourlyMaxAggregateOutputType = {
    ruleId: string | null
    organizationId: string | null
    bucketStart: Date | null
    hits: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RedirectRuleHitsHourlyCountAggregateOutputType = {
    ruleId: number
    organizationId: number
    bucketStart: number
    hits: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RedirectRuleHitsHourlyAvgAggregateInputType = {
    hits?: true
  }

  export type RedirectRuleHitsHourlySumAggregateInputType = {
    hits?: true
  }

  export type RedirectRuleHitsHourlyMinAggregateInputType = {
    ruleId?: true
    organizationId?: true
    bucketStart?: true
    hits?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RedirectRuleHitsHourlyMaxAggregateInputType = {
    ruleId?: true
    organizationId?: true
    bucketStart?: true
    hits?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RedirectRuleHitsHourlyCountAggregateInputType = {
    ruleId?: true
    organizationId?: true
    bucketStart?: true
    hits?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RedirectRuleHitsHourlyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RedirectRuleHitsHourly to aggregate.
     */
    where?: RedirectRuleHitsHourlyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectRuleHitsHourlies to fetch.
     */
    orderBy?: RedirectRuleHitsHourlyOrderByWithRelationInput | RedirectRuleHitsHourlyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RedirectRuleHitsHourlyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectRuleHitsHourlies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectRuleHitsHourlies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RedirectRuleHitsHourlies
    **/
    _count?: true | RedirectRuleHitsHourlyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RedirectRuleHitsHourlyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RedirectRuleHitsHourlySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RedirectRuleHitsHourlyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RedirectRuleHitsHourlyMaxAggregateInputType
  }

  export type GetRedirectRuleHitsHourlyAggregateType<T extends RedirectRuleHitsHourlyAggregateArgs> = {
        [P in keyof T & keyof AggregateRedirectRuleHitsHourly]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRedirectRuleHitsHourly[P]>
      : GetScalarType<T[P], AggregateRedirectRuleHitsHourly[P]>
  }




  export type RedirectRuleHitsHourlyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RedirectRuleHitsHourlyWhereInput
    orderBy?: RedirectRuleHitsHourlyOrderByWithAggregationInput | RedirectRuleHitsHourlyOrderByWithAggregationInput[]
    by: RedirectRuleHitsHourlyScalarFieldEnum[] | RedirectRuleHitsHourlyScalarFieldEnum
    having?: RedirectRuleHitsHourlyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RedirectRuleHitsHourlyCountAggregateInputType | true
    _avg?: RedirectRuleHitsHourlyAvgAggregateInputType
    _sum?: RedirectRuleHitsHourlySumAggregateInputType
    _min?: RedirectRuleHitsHourlyMinAggregateInputType
    _max?: RedirectRuleHitsHourlyMaxAggregateInputType
  }

  export type RedirectRuleHitsHourlyGroupByOutputType = {
    ruleId: string
    organizationId: string
    bucketStart: Date
    hits: number
    createdAt: Date
    updatedAt: Date
    _count: RedirectRuleHitsHourlyCountAggregateOutputType | null
    _avg: RedirectRuleHitsHourlyAvgAggregateOutputType | null
    _sum: RedirectRuleHitsHourlySumAggregateOutputType | null
    _min: RedirectRuleHitsHourlyMinAggregateOutputType | null
    _max: RedirectRuleHitsHourlyMaxAggregateOutputType | null
  }

  type GetRedirectRuleHitsHourlyGroupByPayload<T extends RedirectRuleHitsHourlyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RedirectRuleHitsHourlyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RedirectRuleHitsHourlyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RedirectRuleHitsHourlyGroupByOutputType[P]>
            : GetScalarType<T[P], RedirectRuleHitsHourlyGroupByOutputType[P]>
        }
      >
    >


  export type RedirectRuleHitsHourlySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ruleId?: boolean
    organizationId?: boolean
    bucketStart?: boolean
    hits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    redirectRule?: boolean | RedirectRuleDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["redirectRuleHitsHourly"]>

  export type RedirectRuleHitsHourlySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ruleId?: boolean
    organizationId?: boolean
    bucketStart?: boolean
    hits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    redirectRule?: boolean | RedirectRuleDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["redirectRuleHitsHourly"]>

  export type RedirectRuleHitsHourlySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ruleId?: boolean
    organizationId?: boolean
    bucketStart?: boolean
    hits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    redirectRule?: boolean | RedirectRuleDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["redirectRuleHitsHourly"]>

  export type RedirectRuleHitsHourlySelectScalar = {
    ruleId?: boolean
    organizationId?: boolean
    bucketStart?: boolean
    hits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RedirectRuleHitsHourlyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"ruleId" | "organizationId" | "bucketStart" | "hits" | "createdAt" | "updatedAt", ExtArgs["result"]["redirectRuleHitsHourly"]>
  export type RedirectRuleHitsHourlyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    redirectRule?: boolean | RedirectRuleDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type RedirectRuleHitsHourlyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    redirectRule?: boolean | RedirectRuleDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type RedirectRuleHitsHourlyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    redirectRule?: boolean | RedirectRuleDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $RedirectRuleHitsHourlyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RedirectRuleHitsHourly"
    objects: {
      redirectRule: Prisma.$RedirectRulePayload<ExtArgs>
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      ruleId: string
      organizationId: string
      bucketStart: Date
      hits: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["redirectRuleHitsHourly"]>
    composites: {}
  }

  type RedirectRuleHitsHourlyGetPayload<S extends boolean | null | undefined | RedirectRuleHitsHourlyDefaultArgs> = $Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload, S>

  type RedirectRuleHitsHourlyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RedirectRuleHitsHourlyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RedirectRuleHitsHourlyCountAggregateInputType | true
    }

  export interface RedirectRuleHitsHourlyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RedirectRuleHitsHourly'], meta: { name: 'RedirectRuleHitsHourly' } }
    /**
     * Find zero or one RedirectRuleHitsHourly that matches the filter.
     * @param {RedirectRuleHitsHourlyFindUniqueArgs} args - Arguments to find a RedirectRuleHitsHourly
     * @example
     * // Get one RedirectRuleHitsHourly
     * const redirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RedirectRuleHitsHourlyFindUniqueArgs>(args: SelectSubset<T, RedirectRuleHitsHourlyFindUniqueArgs<ExtArgs>>): Prisma__RedirectRuleHitsHourlyClient<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RedirectRuleHitsHourly that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RedirectRuleHitsHourlyFindUniqueOrThrowArgs} args - Arguments to find a RedirectRuleHitsHourly
     * @example
     * // Get one RedirectRuleHitsHourly
     * const redirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RedirectRuleHitsHourlyFindUniqueOrThrowArgs>(args: SelectSubset<T, RedirectRuleHitsHourlyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RedirectRuleHitsHourlyClient<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RedirectRuleHitsHourly that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleHitsHourlyFindFirstArgs} args - Arguments to find a RedirectRuleHitsHourly
     * @example
     * // Get one RedirectRuleHitsHourly
     * const redirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RedirectRuleHitsHourlyFindFirstArgs>(args?: SelectSubset<T, RedirectRuleHitsHourlyFindFirstArgs<ExtArgs>>): Prisma__RedirectRuleHitsHourlyClient<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RedirectRuleHitsHourly that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleHitsHourlyFindFirstOrThrowArgs} args - Arguments to find a RedirectRuleHitsHourly
     * @example
     * // Get one RedirectRuleHitsHourly
     * const redirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RedirectRuleHitsHourlyFindFirstOrThrowArgs>(args?: SelectSubset<T, RedirectRuleHitsHourlyFindFirstOrThrowArgs<ExtArgs>>): Prisma__RedirectRuleHitsHourlyClient<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RedirectRuleHitsHourlies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleHitsHourlyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RedirectRuleHitsHourlies
     * const redirectRuleHitsHourlies = await prisma.redirectRuleHitsHourly.findMany()
     * 
     * // Get first 10 RedirectRuleHitsHourlies
     * const redirectRuleHitsHourlies = await prisma.redirectRuleHitsHourly.findMany({ take: 10 })
     * 
     * // Only select the `ruleId`
     * const redirectRuleHitsHourlyWithRuleIdOnly = await prisma.redirectRuleHitsHourly.findMany({ select: { ruleId: true } })
     * 
     */
    findMany<T extends RedirectRuleHitsHourlyFindManyArgs>(args?: SelectSubset<T, RedirectRuleHitsHourlyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RedirectRuleHitsHourly.
     * @param {RedirectRuleHitsHourlyCreateArgs} args - Arguments to create a RedirectRuleHitsHourly.
     * @example
     * // Create one RedirectRuleHitsHourly
     * const RedirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.create({
     *   data: {
     *     // ... data to create a RedirectRuleHitsHourly
     *   }
     * })
     * 
     */
    create<T extends RedirectRuleHitsHourlyCreateArgs>(args: SelectSubset<T, RedirectRuleHitsHourlyCreateArgs<ExtArgs>>): Prisma__RedirectRuleHitsHourlyClient<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RedirectRuleHitsHourlies.
     * @param {RedirectRuleHitsHourlyCreateManyArgs} args - Arguments to create many RedirectRuleHitsHourlies.
     * @example
     * // Create many RedirectRuleHitsHourlies
     * const redirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RedirectRuleHitsHourlyCreateManyArgs>(args?: SelectSubset<T, RedirectRuleHitsHourlyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RedirectRuleHitsHourlies and returns the data saved in the database.
     * @param {RedirectRuleHitsHourlyCreateManyAndReturnArgs} args - Arguments to create many RedirectRuleHitsHourlies.
     * @example
     * // Create many RedirectRuleHitsHourlies
     * const redirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RedirectRuleHitsHourlies and only return the `ruleId`
     * const redirectRuleHitsHourlyWithRuleIdOnly = await prisma.redirectRuleHitsHourly.createManyAndReturn({
     *   select: { ruleId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RedirectRuleHitsHourlyCreateManyAndReturnArgs>(args?: SelectSubset<T, RedirectRuleHitsHourlyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RedirectRuleHitsHourly.
     * @param {RedirectRuleHitsHourlyDeleteArgs} args - Arguments to delete one RedirectRuleHitsHourly.
     * @example
     * // Delete one RedirectRuleHitsHourly
     * const RedirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.delete({
     *   where: {
     *     // ... filter to delete one RedirectRuleHitsHourly
     *   }
     * })
     * 
     */
    delete<T extends RedirectRuleHitsHourlyDeleteArgs>(args: SelectSubset<T, RedirectRuleHitsHourlyDeleteArgs<ExtArgs>>): Prisma__RedirectRuleHitsHourlyClient<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RedirectRuleHitsHourly.
     * @param {RedirectRuleHitsHourlyUpdateArgs} args - Arguments to update one RedirectRuleHitsHourly.
     * @example
     * // Update one RedirectRuleHitsHourly
     * const redirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RedirectRuleHitsHourlyUpdateArgs>(args: SelectSubset<T, RedirectRuleHitsHourlyUpdateArgs<ExtArgs>>): Prisma__RedirectRuleHitsHourlyClient<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RedirectRuleHitsHourlies.
     * @param {RedirectRuleHitsHourlyDeleteManyArgs} args - Arguments to filter RedirectRuleHitsHourlies to delete.
     * @example
     * // Delete a few RedirectRuleHitsHourlies
     * const { count } = await prisma.redirectRuleHitsHourly.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RedirectRuleHitsHourlyDeleteManyArgs>(args?: SelectSubset<T, RedirectRuleHitsHourlyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RedirectRuleHitsHourlies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleHitsHourlyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RedirectRuleHitsHourlies
     * const redirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RedirectRuleHitsHourlyUpdateManyArgs>(args: SelectSubset<T, RedirectRuleHitsHourlyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RedirectRuleHitsHourlies and returns the data updated in the database.
     * @param {RedirectRuleHitsHourlyUpdateManyAndReturnArgs} args - Arguments to update many RedirectRuleHitsHourlies.
     * @example
     * // Update many RedirectRuleHitsHourlies
     * const redirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RedirectRuleHitsHourlies and only return the `ruleId`
     * const redirectRuleHitsHourlyWithRuleIdOnly = await prisma.redirectRuleHitsHourly.updateManyAndReturn({
     *   select: { ruleId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RedirectRuleHitsHourlyUpdateManyAndReturnArgs>(args: SelectSubset<T, RedirectRuleHitsHourlyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RedirectRuleHitsHourly.
     * @param {RedirectRuleHitsHourlyUpsertArgs} args - Arguments to update or create a RedirectRuleHitsHourly.
     * @example
     * // Update or create a RedirectRuleHitsHourly
     * const redirectRuleHitsHourly = await prisma.redirectRuleHitsHourly.upsert({
     *   create: {
     *     // ... data to create a RedirectRuleHitsHourly
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RedirectRuleHitsHourly we want to update
     *   }
     * })
     */
    upsert<T extends RedirectRuleHitsHourlyUpsertArgs>(args: SelectSubset<T, RedirectRuleHitsHourlyUpsertArgs<ExtArgs>>): Prisma__RedirectRuleHitsHourlyClient<$Result.GetResult<Prisma.$RedirectRuleHitsHourlyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RedirectRuleHitsHourlies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleHitsHourlyCountArgs} args - Arguments to filter RedirectRuleHitsHourlies to count.
     * @example
     * // Count the number of RedirectRuleHitsHourlies
     * const count = await prisma.redirectRuleHitsHourly.count({
     *   where: {
     *     // ... the filter for the RedirectRuleHitsHourlies we want to count
     *   }
     * })
    **/
    count<T extends RedirectRuleHitsHourlyCountArgs>(
      args?: Subset<T, RedirectRuleHitsHourlyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RedirectRuleHitsHourlyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RedirectRuleHitsHourly.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleHitsHourlyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RedirectRuleHitsHourlyAggregateArgs>(args: Subset<T, RedirectRuleHitsHourlyAggregateArgs>): Prisma.PrismaPromise<GetRedirectRuleHitsHourlyAggregateType<T>>

    /**
     * Group by RedirectRuleHitsHourly.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectRuleHitsHourlyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RedirectRuleHitsHourlyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RedirectRuleHitsHourlyGroupByArgs['orderBy'] }
        : { orderBy?: RedirectRuleHitsHourlyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RedirectRuleHitsHourlyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRedirectRuleHitsHourlyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RedirectRuleHitsHourly model
   */
  readonly fields: RedirectRuleHitsHourlyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RedirectRuleHitsHourly.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RedirectRuleHitsHourlyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    redirectRule<T extends RedirectRuleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RedirectRuleDefaultArgs<ExtArgs>>): Prisma__RedirectRuleClient<$Result.GetResult<Prisma.$RedirectRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RedirectRuleHitsHourly model
   */
  interface RedirectRuleHitsHourlyFieldRefs {
    readonly ruleId: FieldRef<"RedirectRuleHitsHourly", 'String'>
    readonly organizationId: FieldRef<"RedirectRuleHitsHourly", 'String'>
    readonly bucketStart: FieldRef<"RedirectRuleHitsHourly", 'DateTime'>
    readonly hits: FieldRef<"RedirectRuleHitsHourly", 'Int'>
    readonly createdAt: FieldRef<"RedirectRuleHitsHourly", 'DateTime'>
    readonly updatedAt: FieldRef<"RedirectRuleHitsHourly", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RedirectRuleHitsHourly findUnique
   */
  export type RedirectRuleHitsHourlyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    /**
     * Filter, which RedirectRuleHitsHourly to fetch.
     */
    where: RedirectRuleHitsHourlyWhereUniqueInput
  }

  /**
   * RedirectRuleHitsHourly findUniqueOrThrow
   */
  export type RedirectRuleHitsHourlyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    /**
     * Filter, which RedirectRuleHitsHourly to fetch.
     */
    where: RedirectRuleHitsHourlyWhereUniqueInput
  }

  /**
   * RedirectRuleHitsHourly findFirst
   */
  export type RedirectRuleHitsHourlyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    /**
     * Filter, which RedirectRuleHitsHourly to fetch.
     */
    where?: RedirectRuleHitsHourlyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectRuleHitsHourlies to fetch.
     */
    orderBy?: RedirectRuleHitsHourlyOrderByWithRelationInput | RedirectRuleHitsHourlyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RedirectRuleHitsHourlies.
     */
    cursor?: RedirectRuleHitsHourlyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectRuleHitsHourlies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectRuleHitsHourlies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RedirectRuleHitsHourlies.
     */
    distinct?: RedirectRuleHitsHourlyScalarFieldEnum | RedirectRuleHitsHourlyScalarFieldEnum[]
  }

  /**
   * RedirectRuleHitsHourly findFirstOrThrow
   */
  export type RedirectRuleHitsHourlyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    /**
     * Filter, which RedirectRuleHitsHourly to fetch.
     */
    where?: RedirectRuleHitsHourlyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectRuleHitsHourlies to fetch.
     */
    orderBy?: RedirectRuleHitsHourlyOrderByWithRelationInput | RedirectRuleHitsHourlyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RedirectRuleHitsHourlies.
     */
    cursor?: RedirectRuleHitsHourlyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectRuleHitsHourlies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectRuleHitsHourlies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RedirectRuleHitsHourlies.
     */
    distinct?: RedirectRuleHitsHourlyScalarFieldEnum | RedirectRuleHitsHourlyScalarFieldEnum[]
  }

  /**
   * RedirectRuleHitsHourly findMany
   */
  export type RedirectRuleHitsHourlyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    /**
     * Filter, which RedirectRuleHitsHourlies to fetch.
     */
    where?: RedirectRuleHitsHourlyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectRuleHitsHourlies to fetch.
     */
    orderBy?: RedirectRuleHitsHourlyOrderByWithRelationInput | RedirectRuleHitsHourlyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RedirectRuleHitsHourlies.
     */
    cursor?: RedirectRuleHitsHourlyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectRuleHitsHourlies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectRuleHitsHourlies.
     */
    skip?: number
    distinct?: RedirectRuleHitsHourlyScalarFieldEnum | RedirectRuleHitsHourlyScalarFieldEnum[]
  }

  /**
   * RedirectRuleHitsHourly create
   */
  export type RedirectRuleHitsHourlyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    /**
     * The data needed to create a RedirectRuleHitsHourly.
     */
    data: XOR<RedirectRuleHitsHourlyCreateInput, RedirectRuleHitsHourlyUncheckedCreateInput>
  }

  /**
   * RedirectRuleHitsHourly createMany
   */
  export type RedirectRuleHitsHourlyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RedirectRuleHitsHourlies.
     */
    data: RedirectRuleHitsHourlyCreateManyInput | RedirectRuleHitsHourlyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RedirectRuleHitsHourly createManyAndReturn
   */
  export type RedirectRuleHitsHourlyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * The data used to create many RedirectRuleHitsHourlies.
     */
    data: RedirectRuleHitsHourlyCreateManyInput | RedirectRuleHitsHourlyCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RedirectRuleHitsHourly update
   */
  export type RedirectRuleHitsHourlyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    /**
     * The data needed to update a RedirectRuleHitsHourly.
     */
    data: XOR<RedirectRuleHitsHourlyUpdateInput, RedirectRuleHitsHourlyUncheckedUpdateInput>
    /**
     * Choose, which RedirectRuleHitsHourly to update.
     */
    where: RedirectRuleHitsHourlyWhereUniqueInput
  }

  /**
   * RedirectRuleHitsHourly updateMany
   */
  export type RedirectRuleHitsHourlyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RedirectRuleHitsHourlies.
     */
    data: XOR<RedirectRuleHitsHourlyUpdateManyMutationInput, RedirectRuleHitsHourlyUncheckedUpdateManyInput>
    /**
     * Filter which RedirectRuleHitsHourlies to update
     */
    where?: RedirectRuleHitsHourlyWhereInput
    /**
     * Limit how many RedirectRuleHitsHourlies to update.
     */
    limit?: number
  }

  /**
   * RedirectRuleHitsHourly updateManyAndReturn
   */
  export type RedirectRuleHitsHourlyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * The data used to update RedirectRuleHitsHourlies.
     */
    data: XOR<RedirectRuleHitsHourlyUpdateManyMutationInput, RedirectRuleHitsHourlyUncheckedUpdateManyInput>
    /**
     * Filter which RedirectRuleHitsHourlies to update
     */
    where?: RedirectRuleHitsHourlyWhereInput
    /**
     * Limit how many RedirectRuleHitsHourlies to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RedirectRuleHitsHourly upsert
   */
  export type RedirectRuleHitsHourlyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    /**
     * The filter to search for the RedirectRuleHitsHourly to update in case it exists.
     */
    where: RedirectRuleHitsHourlyWhereUniqueInput
    /**
     * In case the RedirectRuleHitsHourly found by the `where` argument doesn't exist, create a new RedirectRuleHitsHourly with this data.
     */
    create: XOR<RedirectRuleHitsHourlyCreateInput, RedirectRuleHitsHourlyUncheckedCreateInput>
    /**
     * In case the RedirectRuleHitsHourly was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RedirectRuleHitsHourlyUpdateInput, RedirectRuleHitsHourlyUncheckedUpdateInput>
  }

  /**
   * RedirectRuleHitsHourly delete
   */
  export type RedirectRuleHitsHourlyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
    /**
     * Filter which RedirectRuleHitsHourly to delete.
     */
    where: RedirectRuleHitsHourlyWhereUniqueInput
  }

  /**
   * RedirectRuleHitsHourly deleteMany
   */
  export type RedirectRuleHitsHourlyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RedirectRuleHitsHourlies to delete
     */
    where?: RedirectRuleHitsHourlyWhereInput
    /**
     * Limit how many RedirectRuleHitsHourlies to delete.
     */
    limit?: number
  }

  /**
   * RedirectRuleHitsHourly without action
   */
  export type RedirectRuleHitsHourlyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectRuleHitsHourly
     */
    select?: RedirectRuleHitsHourlySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectRuleHitsHourly
     */
    omit?: RedirectRuleHitsHourlyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectRuleHitsHourlyInclude<ExtArgs> | null
  }


  /**
   * Model RedirectTest
   */

  export type AggregateRedirectTest = {
    _count: RedirectTestCountAggregateOutputType | null
    _min: RedirectTestMinAggregateOutputType | null
    _max: RedirectTestMaxAggregateOutputType | null
  }

  export type RedirectTestMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    domainGroupId: string | null
    pathWithQuery: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type RedirectTestMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    domainGroupId: string | null
    pathWithQuery: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type RedirectTestCountAggregateOutputType = {
    id: number
    organizationId: number
    domainGroupId: number
    pathWithQuery: number
    requestData: number
    expectedResult: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type RedirectTestMinAggregateInputType = {
    id?: true
    organizationId?: true
    domainGroupId?: true
    pathWithQuery?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type RedirectTestMaxAggregateInputType = {
    id?: true
    organizationId?: true
    domainGroupId?: true
    pathWithQuery?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type RedirectTestCountAggregateInputType = {
    id?: true
    organizationId?: true
    domainGroupId?: true
    pathWithQuery?: true
    requestData?: true
    expectedResult?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type RedirectTestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RedirectTest to aggregate.
     */
    where?: RedirectTestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectTests to fetch.
     */
    orderBy?: RedirectTestOrderByWithRelationInput | RedirectTestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RedirectTestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectTests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectTests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RedirectTests
    **/
    _count?: true | RedirectTestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RedirectTestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RedirectTestMaxAggregateInputType
  }

  export type GetRedirectTestAggregateType<T extends RedirectTestAggregateArgs> = {
        [P in keyof T & keyof AggregateRedirectTest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRedirectTest[P]>
      : GetScalarType<T[P], AggregateRedirectTest[P]>
  }




  export type RedirectTestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RedirectTestWhereInput
    orderBy?: RedirectTestOrderByWithAggregationInput | RedirectTestOrderByWithAggregationInput[]
    by: RedirectTestScalarFieldEnum[] | RedirectTestScalarFieldEnum
    having?: RedirectTestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RedirectTestCountAggregateInputType | true
    _min?: RedirectTestMinAggregateInputType
    _max?: RedirectTestMaxAggregateInputType
  }

  export type RedirectTestGroupByOutputType = {
    id: string
    organizationId: string
    domainGroupId: string
    pathWithQuery: string
    requestData: JsonValue
    expectedResult: JsonValue
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: RedirectTestCountAggregateOutputType | null
    _min: RedirectTestMinAggregateOutputType | null
    _max: RedirectTestMaxAggregateOutputType | null
  }

  type GetRedirectTestGroupByPayload<T extends RedirectTestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RedirectTestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RedirectTestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RedirectTestGroupByOutputType[P]>
            : GetScalarType<T[P], RedirectTestGroupByOutputType[P]>
        }
      >
    >


  export type RedirectTestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    domainGroupId?: boolean
    pathWithQuery?: boolean
    requestData?: boolean
    expectedResult?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["redirectTest"]>

  export type RedirectTestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    domainGroupId?: boolean
    pathWithQuery?: boolean
    requestData?: boolean
    expectedResult?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["redirectTest"]>

  export type RedirectTestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    domainGroupId?: boolean
    pathWithQuery?: boolean
    requestData?: boolean
    expectedResult?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["redirectTest"]>

  export type RedirectTestSelectScalar = {
    id?: boolean
    organizationId?: boolean
    domainGroupId?: boolean
    pathWithQuery?: boolean
    requestData?: boolean
    expectedResult?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type RedirectTestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "domainGroupId" | "pathWithQuery" | "requestData" | "expectedResult" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["redirectTest"]>
  export type RedirectTestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }
  export type RedirectTestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }
  export type RedirectTestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }

  export type $RedirectTestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RedirectTest"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      domainGroup: Prisma.$DomainGroupPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      domainGroupId: string
      pathWithQuery: string
      requestData: Prisma.JsonValue
      expectedResult: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["redirectTest"]>
    composites: {}
  }

  type RedirectTestGetPayload<S extends boolean | null | undefined | RedirectTestDefaultArgs> = $Result.GetResult<Prisma.$RedirectTestPayload, S>

  type RedirectTestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RedirectTestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RedirectTestCountAggregateInputType | true
    }

  export interface RedirectTestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RedirectTest'], meta: { name: 'RedirectTest' } }
    /**
     * Find zero or one RedirectTest that matches the filter.
     * @param {RedirectTestFindUniqueArgs} args - Arguments to find a RedirectTest
     * @example
     * // Get one RedirectTest
     * const redirectTest = await prisma.redirectTest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RedirectTestFindUniqueArgs>(args: SelectSubset<T, RedirectTestFindUniqueArgs<ExtArgs>>): Prisma__RedirectTestClient<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RedirectTest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RedirectTestFindUniqueOrThrowArgs} args - Arguments to find a RedirectTest
     * @example
     * // Get one RedirectTest
     * const redirectTest = await prisma.redirectTest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RedirectTestFindUniqueOrThrowArgs>(args: SelectSubset<T, RedirectTestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RedirectTestClient<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RedirectTest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectTestFindFirstArgs} args - Arguments to find a RedirectTest
     * @example
     * // Get one RedirectTest
     * const redirectTest = await prisma.redirectTest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RedirectTestFindFirstArgs>(args?: SelectSubset<T, RedirectTestFindFirstArgs<ExtArgs>>): Prisma__RedirectTestClient<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RedirectTest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectTestFindFirstOrThrowArgs} args - Arguments to find a RedirectTest
     * @example
     * // Get one RedirectTest
     * const redirectTest = await prisma.redirectTest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RedirectTestFindFirstOrThrowArgs>(args?: SelectSubset<T, RedirectTestFindFirstOrThrowArgs<ExtArgs>>): Prisma__RedirectTestClient<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RedirectTests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectTestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RedirectTests
     * const redirectTests = await prisma.redirectTest.findMany()
     * 
     * // Get first 10 RedirectTests
     * const redirectTests = await prisma.redirectTest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const redirectTestWithIdOnly = await prisma.redirectTest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RedirectTestFindManyArgs>(args?: SelectSubset<T, RedirectTestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RedirectTest.
     * @param {RedirectTestCreateArgs} args - Arguments to create a RedirectTest.
     * @example
     * // Create one RedirectTest
     * const RedirectTest = await prisma.redirectTest.create({
     *   data: {
     *     // ... data to create a RedirectTest
     *   }
     * })
     * 
     */
    create<T extends RedirectTestCreateArgs>(args: SelectSubset<T, RedirectTestCreateArgs<ExtArgs>>): Prisma__RedirectTestClient<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RedirectTests.
     * @param {RedirectTestCreateManyArgs} args - Arguments to create many RedirectTests.
     * @example
     * // Create many RedirectTests
     * const redirectTest = await prisma.redirectTest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RedirectTestCreateManyArgs>(args?: SelectSubset<T, RedirectTestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RedirectTests and returns the data saved in the database.
     * @param {RedirectTestCreateManyAndReturnArgs} args - Arguments to create many RedirectTests.
     * @example
     * // Create many RedirectTests
     * const redirectTest = await prisma.redirectTest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RedirectTests and only return the `id`
     * const redirectTestWithIdOnly = await prisma.redirectTest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RedirectTestCreateManyAndReturnArgs>(args?: SelectSubset<T, RedirectTestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RedirectTest.
     * @param {RedirectTestDeleteArgs} args - Arguments to delete one RedirectTest.
     * @example
     * // Delete one RedirectTest
     * const RedirectTest = await prisma.redirectTest.delete({
     *   where: {
     *     // ... filter to delete one RedirectTest
     *   }
     * })
     * 
     */
    delete<T extends RedirectTestDeleteArgs>(args: SelectSubset<T, RedirectTestDeleteArgs<ExtArgs>>): Prisma__RedirectTestClient<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RedirectTest.
     * @param {RedirectTestUpdateArgs} args - Arguments to update one RedirectTest.
     * @example
     * // Update one RedirectTest
     * const redirectTest = await prisma.redirectTest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RedirectTestUpdateArgs>(args: SelectSubset<T, RedirectTestUpdateArgs<ExtArgs>>): Prisma__RedirectTestClient<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RedirectTests.
     * @param {RedirectTestDeleteManyArgs} args - Arguments to filter RedirectTests to delete.
     * @example
     * // Delete a few RedirectTests
     * const { count } = await prisma.redirectTest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RedirectTestDeleteManyArgs>(args?: SelectSubset<T, RedirectTestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RedirectTests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectTestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RedirectTests
     * const redirectTest = await prisma.redirectTest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RedirectTestUpdateManyArgs>(args: SelectSubset<T, RedirectTestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RedirectTests and returns the data updated in the database.
     * @param {RedirectTestUpdateManyAndReturnArgs} args - Arguments to update many RedirectTests.
     * @example
     * // Update many RedirectTests
     * const redirectTest = await prisma.redirectTest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RedirectTests and only return the `id`
     * const redirectTestWithIdOnly = await prisma.redirectTest.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RedirectTestUpdateManyAndReturnArgs>(args: SelectSubset<T, RedirectTestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RedirectTest.
     * @param {RedirectTestUpsertArgs} args - Arguments to update or create a RedirectTest.
     * @example
     * // Update or create a RedirectTest
     * const redirectTest = await prisma.redirectTest.upsert({
     *   create: {
     *     // ... data to create a RedirectTest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RedirectTest we want to update
     *   }
     * })
     */
    upsert<T extends RedirectTestUpsertArgs>(args: SelectSubset<T, RedirectTestUpsertArgs<ExtArgs>>): Prisma__RedirectTestClient<$Result.GetResult<Prisma.$RedirectTestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RedirectTests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectTestCountArgs} args - Arguments to filter RedirectTests to count.
     * @example
     * // Count the number of RedirectTests
     * const count = await prisma.redirectTest.count({
     *   where: {
     *     // ... the filter for the RedirectTests we want to count
     *   }
     * })
    **/
    count<T extends RedirectTestCountArgs>(
      args?: Subset<T, RedirectTestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RedirectTestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RedirectTest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectTestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RedirectTestAggregateArgs>(args: Subset<T, RedirectTestAggregateArgs>): Prisma.PrismaPromise<GetRedirectTestAggregateType<T>>

    /**
     * Group by RedirectTest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectTestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RedirectTestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RedirectTestGroupByArgs['orderBy'] }
        : { orderBy?: RedirectTestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RedirectTestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRedirectTestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RedirectTest model
   */
  readonly fields: RedirectTestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RedirectTest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RedirectTestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    domainGroup<T extends DomainGroupDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DomainGroupDefaultArgs<ExtArgs>>): Prisma__DomainGroupClient<$Result.GetResult<Prisma.$DomainGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RedirectTest model
   */
  interface RedirectTestFieldRefs {
    readonly id: FieldRef<"RedirectTest", 'String'>
    readonly organizationId: FieldRef<"RedirectTest", 'String'>
    readonly domainGroupId: FieldRef<"RedirectTest", 'String'>
    readonly pathWithQuery: FieldRef<"RedirectTest", 'String'>
    readonly requestData: FieldRef<"RedirectTest", 'Json'>
    readonly expectedResult: FieldRef<"RedirectTest", 'Json'>
    readonly createdAt: FieldRef<"RedirectTest", 'DateTime'>
    readonly updatedAt: FieldRef<"RedirectTest", 'DateTime'>
    readonly deletedAt: FieldRef<"RedirectTest", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RedirectTest findUnique
   */
  export type RedirectTestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    /**
     * Filter, which RedirectTest to fetch.
     */
    where: RedirectTestWhereUniqueInput
  }

  /**
   * RedirectTest findUniqueOrThrow
   */
  export type RedirectTestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    /**
     * Filter, which RedirectTest to fetch.
     */
    where: RedirectTestWhereUniqueInput
  }

  /**
   * RedirectTest findFirst
   */
  export type RedirectTestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    /**
     * Filter, which RedirectTest to fetch.
     */
    where?: RedirectTestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectTests to fetch.
     */
    orderBy?: RedirectTestOrderByWithRelationInput | RedirectTestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RedirectTests.
     */
    cursor?: RedirectTestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectTests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectTests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RedirectTests.
     */
    distinct?: RedirectTestScalarFieldEnum | RedirectTestScalarFieldEnum[]
  }

  /**
   * RedirectTest findFirstOrThrow
   */
  export type RedirectTestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    /**
     * Filter, which RedirectTest to fetch.
     */
    where?: RedirectTestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectTests to fetch.
     */
    orderBy?: RedirectTestOrderByWithRelationInput | RedirectTestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RedirectTests.
     */
    cursor?: RedirectTestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectTests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectTests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RedirectTests.
     */
    distinct?: RedirectTestScalarFieldEnum | RedirectTestScalarFieldEnum[]
  }

  /**
   * RedirectTest findMany
   */
  export type RedirectTestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    /**
     * Filter, which RedirectTests to fetch.
     */
    where?: RedirectTestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RedirectTests to fetch.
     */
    orderBy?: RedirectTestOrderByWithRelationInput | RedirectTestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RedirectTests.
     */
    cursor?: RedirectTestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RedirectTests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RedirectTests.
     */
    skip?: number
    distinct?: RedirectTestScalarFieldEnum | RedirectTestScalarFieldEnum[]
  }

  /**
   * RedirectTest create
   */
  export type RedirectTestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    /**
     * The data needed to create a RedirectTest.
     */
    data: XOR<RedirectTestCreateInput, RedirectTestUncheckedCreateInput>
  }

  /**
   * RedirectTest createMany
   */
  export type RedirectTestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RedirectTests.
     */
    data: RedirectTestCreateManyInput | RedirectTestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RedirectTest createManyAndReturn
   */
  export type RedirectTestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * The data used to create many RedirectTests.
     */
    data: RedirectTestCreateManyInput | RedirectTestCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RedirectTest update
   */
  export type RedirectTestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    /**
     * The data needed to update a RedirectTest.
     */
    data: XOR<RedirectTestUpdateInput, RedirectTestUncheckedUpdateInput>
    /**
     * Choose, which RedirectTest to update.
     */
    where: RedirectTestWhereUniqueInput
  }

  /**
   * RedirectTest updateMany
   */
  export type RedirectTestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RedirectTests.
     */
    data: XOR<RedirectTestUpdateManyMutationInput, RedirectTestUncheckedUpdateManyInput>
    /**
     * Filter which RedirectTests to update
     */
    where?: RedirectTestWhereInput
    /**
     * Limit how many RedirectTests to update.
     */
    limit?: number
  }

  /**
   * RedirectTest updateManyAndReturn
   */
  export type RedirectTestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * The data used to update RedirectTests.
     */
    data: XOR<RedirectTestUpdateManyMutationInput, RedirectTestUncheckedUpdateManyInput>
    /**
     * Filter which RedirectTests to update
     */
    where?: RedirectTestWhereInput
    /**
     * Limit how many RedirectTests to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RedirectTest upsert
   */
  export type RedirectTestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    /**
     * The filter to search for the RedirectTest to update in case it exists.
     */
    where: RedirectTestWhereUniqueInput
    /**
     * In case the RedirectTest found by the `where` argument doesn't exist, create a new RedirectTest with this data.
     */
    create: XOR<RedirectTestCreateInput, RedirectTestUncheckedCreateInput>
    /**
     * In case the RedirectTest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RedirectTestUpdateInput, RedirectTestUncheckedUpdateInput>
  }

  /**
   * RedirectTest delete
   */
  export type RedirectTestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
    /**
     * Filter which RedirectTest to delete.
     */
    where: RedirectTestWhereUniqueInput
  }

  /**
   * RedirectTest deleteMany
   */
  export type RedirectTestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RedirectTests to delete
     */
    where?: RedirectTestWhereInput
    /**
     * Limit how many RedirectTests to delete.
     */
    limit?: number
  }

  /**
   * RedirectTest without action
   */
  export type RedirectTestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RedirectTest
     */
    select?: RedirectTestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RedirectTest
     */
    omit?: RedirectTestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RedirectTestInclude<ExtArgs> | null
  }


  /**
   * Model BillingCheckoutSession
   */

  export type AggregateBillingCheckoutSession = {
    _count: BillingCheckoutSessionCountAggregateOutputType | null
    _min: BillingCheckoutSessionMinAggregateOutputType | null
    _max: BillingCheckoutSessionMaxAggregateOutputType | null
  }

  export type BillingCheckoutSessionMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    userId: string | null
    plan: string | null
    status: $Enums.BillingCheckoutStatus | null
    providerCheckoutId: string | null
    providerOrderId: string | null
    providerSubscriptionId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    completedAt: Date | null
  }

  export type BillingCheckoutSessionMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    userId: string | null
    plan: string | null
    status: $Enums.BillingCheckoutStatus | null
    providerCheckoutId: string | null
    providerOrderId: string | null
    providerSubscriptionId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    completedAt: Date | null
  }

  export type BillingCheckoutSessionCountAggregateOutputType = {
    id: number
    organizationId: number
    userId: number
    plan: number
    status: number
    providerCheckoutId: number
    providerOrderId: number
    providerSubscriptionId: number
    createdAt: number
    updatedAt: number
    completedAt: number
    metadata: number
    _all: number
  }


  export type BillingCheckoutSessionMinAggregateInputType = {
    id?: true
    organizationId?: true
    userId?: true
    plan?: true
    status?: true
    providerCheckoutId?: true
    providerOrderId?: true
    providerSubscriptionId?: true
    createdAt?: true
    updatedAt?: true
    completedAt?: true
  }

  export type BillingCheckoutSessionMaxAggregateInputType = {
    id?: true
    organizationId?: true
    userId?: true
    plan?: true
    status?: true
    providerCheckoutId?: true
    providerOrderId?: true
    providerSubscriptionId?: true
    createdAt?: true
    updatedAt?: true
    completedAt?: true
  }

  export type BillingCheckoutSessionCountAggregateInputType = {
    id?: true
    organizationId?: true
    userId?: true
    plan?: true
    status?: true
    providerCheckoutId?: true
    providerOrderId?: true
    providerSubscriptionId?: true
    createdAt?: true
    updatedAt?: true
    completedAt?: true
    metadata?: true
    _all?: true
  }

  export type BillingCheckoutSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BillingCheckoutSession to aggregate.
     */
    where?: BillingCheckoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BillingCheckoutSessions to fetch.
     */
    orderBy?: BillingCheckoutSessionOrderByWithRelationInput | BillingCheckoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BillingCheckoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BillingCheckoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BillingCheckoutSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BillingCheckoutSessions
    **/
    _count?: true | BillingCheckoutSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BillingCheckoutSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BillingCheckoutSessionMaxAggregateInputType
  }

  export type GetBillingCheckoutSessionAggregateType<T extends BillingCheckoutSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateBillingCheckoutSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBillingCheckoutSession[P]>
      : GetScalarType<T[P], AggregateBillingCheckoutSession[P]>
  }




  export type BillingCheckoutSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BillingCheckoutSessionWhereInput
    orderBy?: BillingCheckoutSessionOrderByWithAggregationInput | BillingCheckoutSessionOrderByWithAggregationInput[]
    by: BillingCheckoutSessionScalarFieldEnum[] | BillingCheckoutSessionScalarFieldEnum
    having?: BillingCheckoutSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BillingCheckoutSessionCountAggregateInputType | true
    _min?: BillingCheckoutSessionMinAggregateInputType
    _max?: BillingCheckoutSessionMaxAggregateInputType
  }

  export type BillingCheckoutSessionGroupByOutputType = {
    id: string
    organizationId: string
    userId: string
    plan: string
    status: $Enums.BillingCheckoutStatus
    providerCheckoutId: string | null
    providerOrderId: string | null
    providerSubscriptionId: string | null
    createdAt: Date
    updatedAt: Date
    completedAt: Date | null
    metadata: JsonValue | null
    _count: BillingCheckoutSessionCountAggregateOutputType | null
    _min: BillingCheckoutSessionMinAggregateOutputType | null
    _max: BillingCheckoutSessionMaxAggregateOutputType | null
  }

  type GetBillingCheckoutSessionGroupByPayload<T extends BillingCheckoutSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BillingCheckoutSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BillingCheckoutSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BillingCheckoutSessionGroupByOutputType[P]>
            : GetScalarType<T[P], BillingCheckoutSessionGroupByOutputType[P]>
        }
      >
    >


  export type BillingCheckoutSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    userId?: boolean
    plan?: boolean
    status?: boolean
    providerCheckoutId?: boolean
    providerOrderId?: boolean
    providerSubscriptionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
    metadata?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["billingCheckoutSession"]>

  export type BillingCheckoutSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    userId?: boolean
    plan?: boolean
    status?: boolean
    providerCheckoutId?: boolean
    providerOrderId?: boolean
    providerSubscriptionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
    metadata?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["billingCheckoutSession"]>

  export type BillingCheckoutSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    userId?: boolean
    plan?: boolean
    status?: boolean
    providerCheckoutId?: boolean
    providerOrderId?: boolean
    providerSubscriptionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
    metadata?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["billingCheckoutSession"]>

  export type BillingCheckoutSessionSelectScalar = {
    id?: boolean
    organizationId?: boolean
    userId?: boolean
    plan?: boolean
    status?: boolean
    providerCheckoutId?: boolean
    providerOrderId?: boolean
    providerSubscriptionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
    metadata?: boolean
  }

  export type BillingCheckoutSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "userId" | "plan" | "status" | "providerCheckoutId" | "providerOrderId" | "providerSubscriptionId" | "createdAt" | "updatedAt" | "completedAt" | "metadata", ExtArgs["result"]["billingCheckoutSession"]>
  export type BillingCheckoutSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BillingCheckoutSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BillingCheckoutSessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $BillingCheckoutSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BillingCheckoutSession"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      userId: string
      plan: string
      status: $Enums.BillingCheckoutStatus
      providerCheckoutId: string | null
      providerOrderId: string | null
      providerSubscriptionId: string | null
      createdAt: Date
      updatedAt: Date
      completedAt: Date | null
      metadata: Prisma.JsonValue | null
    }, ExtArgs["result"]["billingCheckoutSession"]>
    composites: {}
  }

  type BillingCheckoutSessionGetPayload<S extends boolean | null | undefined | BillingCheckoutSessionDefaultArgs> = $Result.GetResult<Prisma.$BillingCheckoutSessionPayload, S>

  type BillingCheckoutSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BillingCheckoutSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BillingCheckoutSessionCountAggregateInputType | true
    }

  export interface BillingCheckoutSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BillingCheckoutSession'], meta: { name: 'BillingCheckoutSession' } }
    /**
     * Find zero or one BillingCheckoutSession that matches the filter.
     * @param {BillingCheckoutSessionFindUniqueArgs} args - Arguments to find a BillingCheckoutSession
     * @example
     * // Get one BillingCheckoutSession
     * const billingCheckoutSession = await prisma.billingCheckoutSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BillingCheckoutSessionFindUniqueArgs>(args: SelectSubset<T, BillingCheckoutSessionFindUniqueArgs<ExtArgs>>): Prisma__BillingCheckoutSessionClient<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BillingCheckoutSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BillingCheckoutSessionFindUniqueOrThrowArgs} args - Arguments to find a BillingCheckoutSession
     * @example
     * // Get one BillingCheckoutSession
     * const billingCheckoutSession = await prisma.billingCheckoutSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BillingCheckoutSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, BillingCheckoutSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BillingCheckoutSessionClient<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BillingCheckoutSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillingCheckoutSessionFindFirstArgs} args - Arguments to find a BillingCheckoutSession
     * @example
     * // Get one BillingCheckoutSession
     * const billingCheckoutSession = await prisma.billingCheckoutSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BillingCheckoutSessionFindFirstArgs>(args?: SelectSubset<T, BillingCheckoutSessionFindFirstArgs<ExtArgs>>): Prisma__BillingCheckoutSessionClient<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BillingCheckoutSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillingCheckoutSessionFindFirstOrThrowArgs} args - Arguments to find a BillingCheckoutSession
     * @example
     * // Get one BillingCheckoutSession
     * const billingCheckoutSession = await prisma.billingCheckoutSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BillingCheckoutSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, BillingCheckoutSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__BillingCheckoutSessionClient<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BillingCheckoutSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillingCheckoutSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BillingCheckoutSessions
     * const billingCheckoutSessions = await prisma.billingCheckoutSession.findMany()
     * 
     * // Get first 10 BillingCheckoutSessions
     * const billingCheckoutSessions = await prisma.billingCheckoutSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const billingCheckoutSessionWithIdOnly = await prisma.billingCheckoutSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BillingCheckoutSessionFindManyArgs>(args?: SelectSubset<T, BillingCheckoutSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BillingCheckoutSession.
     * @param {BillingCheckoutSessionCreateArgs} args - Arguments to create a BillingCheckoutSession.
     * @example
     * // Create one BillingCheckoutSession
     * const BillingCheckoutSession = await prisma.billingCheckoutSession.create({
     *   data: {
     *     // ... data to create a BillingCheckoutSession
     *   }
     * })
     * 
     */
    create<T extends BillingCheckoutSessionCreateArgs>(args: SelectSubset<T, BillingCheckoutSessionCreateArgs<ExtArgs>>): Prisma__BillingCheckoutSessionClient<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BillingCheckoutSessions.
     * @param {BillingCheckoutSessionCreateManyArgs} args - Arguments to create many BillingCheckoutSessions.
     * @example
     * // Create many BillingCheckoutSessions
     * const billingCheckoutSession = await prisma.billingCheckoutSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BillingCheckoutSessionCreateManyArgs>(args?: SelectSubset<T, BillingCheckoutSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BillingCheckoutSessions and returns the data saved in the database.
     * @param {BillingCheckoutSessionCreateManyAndReturnArgs} args - Arguments to create many BillingCheckoutSessions.
     * @example
     * // Create many BillingCheckoutSessions
     * const billingCheckoutSession = await prisma.billingCheckoutSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BillingCheckoutSessions and only return the `id`
     * const billingCheckoutSessionWithIdOnly = await prisma.billingCheckoutSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BillingCheckoutSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, BillingCheckoutSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BillingCheckoutSession.
     * @param {BillingCheckoutSessionDeleteArgs} args - Arguments to delete one BillingCheckoutSession.
     * @example
     * // Delete one BillingCheckoutSession
     * const BillingCheckoutSession = await prisma.billingCheckoutSession.delete({
     *   where: {
     *     // ... filter to delete one BillingCheckoutSession
     *   }
     * })
     * 
     */
    delete<T extends BillingCheckoutSessionDeleteArgs>(args: SelectSubset<T, BillingCheckoutSessionDeleteArgs<ExtArgs>>): Prisma__BillingCheckoutSessionClient<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BillingCheckoutSession.
     * @param {BillingCheckoutSessionUpdateArgs} args - Arguments to update one BillingCheckoutSession.
     * @example
     * // Update one BillingCheckoutSession
     * const billingCheckoutSession = await prisma.billingCheckoutSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BillingCheckoutSessionUpdateArgs>(args: SelectSubset<T, BillingCheckoutSessionUpdateArgs<ExtArgs>>): Prisma__BillingCheckoutSessionClient<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BillingCheckoutSessions.
     * @param {BillingCheckoutSessionDeleteManyArgs} args - Arguments to filter BillingCheckoutSessions to delete.
     * @example
     * // Delete a few BillingCheckoutSessions
     * const { count } = await prisma.billingCheckoutSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BillingCheckoutSessionDeleteManyArgs>(args?: SelectSubset<T, BillingCheckoutSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BillingCheckoutSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillingCheckoutSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BillingCheckoutSessions
     * const billingCheckoutSession = await prisma.billingCheckoutSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BillingCheckoutSessionUpdateManyArgs>(args: SelectSubset<T, BillingCheckoutSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BillingCheckoutSessions and returns the data updated in the database.
     * @param {BillingCheckoutSessionUpdateManyAndReturnArgs} args - Arguments to update many BillingCheckoutSessions.
     * @example
     * // Update many BillingCheckoutSessions
     * const billingCheckoutSession = await prisma.billingCheckoutSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BillingCheckoutSessions and only return the `id`
     * const billingCheckoutSessionWithIdOnly = await prisma.billingCheckoutSession.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BillingCheckoutSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, BillingCheckoutSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BillingCheckoutSession.
     * @param {BillingCheckoutSessionUpsertArgs} args - Arguments to update or create a BillingCheckoutSession.
     * @example
     * // Update or create a BillingCheckoutSession
     * const billingCheckoutSession = await prisma.billingCheckoutSession.upsert({
     *   create: {
     *     // ... data to create a BillingCheckoutSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BillingCheckoutSession we want to update
     *   }
     * })
     */
    upsert<T extends BillingCheckoutSessionUpsertArgs>(args: SelectSubset<T, BillingCheckoutSessionUpsertArgs<ExtArgs>>): Prisma__BillingCheckoutSessionClient<$Result.GetResult<Prisma.$BillingCheckoutSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BillingCheckoutSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillingCheckoutSessionCountArgs} args - Arguments to filter BillingCheckoutSessions to count.
     * @example
     * // Count the number of BillingCheckoutSessions
     * const count = await prisma.billingCheckoutSession.count({
     *   where: {
     *     // ... the filter for the BillingCheckoutSessions we want to count
     *   }
     * })
    **/
    count<T extends BillingCheckoutSessionCountArgs>(
      args?: Subset<T, BillingCheckoutSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BillingCheckoutSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BillingCheckoutSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillingCheckoutSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BillingCheckoutSessionAggregateArgs>(args: Subset<T, BillingCheckoutSessionAggregateArgs>): Prisma.PrismaPromise<GetBillingCheckoutSessionAggregateType<T>>

    /**
     * Group by BillingCheckoutSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillingCheckoutSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BillingCheckoutSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BillingCheckoutSessionGroupByArgs['orderBy'] }
        : { orderBy?: BillingCheckoutSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BillingCheckoutSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBillingCheckoutSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BillingCheckoutSession model
   */
  readonly fields: BillingCheckoutSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BillingCheckoutSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BillingCheckoutSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BillingCheckoutSession model
   */
  interface BillingCheckoutSessionFieldRefs {
    readonly id: FieldRef<"BillingCheckoutSession", 'String'>
    readonly organizationId: FieldRef<"BillingCheckoutSession", 'String'>
    readonly userId: FieldRef<"BillingCheckoutSession", 'String'>
    readonly plan: FieldRef<"BillingCheckoutSession", 'String'>
    readonly status: FieldRef<"BillingCheckoutSession", 'BillingCheckoutStatus'>
    readonly providerCheckoutId: FieldRef<"BillingCheckoutSession", 'String'>
    readonly providerOrderId: FieldRef<"BillingCheckoutSession", 'String'>
    readonly providerSubscriptionId: FieldRef<"BillingCheckoutSession", 'String'>
    readonly createdAt: FieldRef<"BillingCheckoutSession", 'DateTime'>
    readonly updatedAt: FieldRef<"BillingCheckoutSession", 'DateTime'>
    readonly completedAt: FieldRef<"BillingCheckoutSession", 'DateTime'>
    readonly metadata: FieldRef<"BillingCheckoutSession", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * BillingCheckoutSession findUnique
   */
  export type BillingCheckoutSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which BillingCheckoutSession to fetch.
     */
    where: BillingCheckoutSessionWhereUniqueInput
  }

  /**
   * BillingCheckoutSession findUniqueOrThrow
   */
  export type BillingCheckoutSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which BillingCheckoutSession to fetch.
     */
    where: BillingCheckoutSessionWhereUniqueInput
  }

  /**
   * BillingCheckoutSession findFirst
   */
  export type BillingCheckoutSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which BillingCheckoutSession to fetch.
     */
    where?: BillingCheckoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BillingCheckoutSessions to fetch.
     */
    orderBy?: BillingCheckoutSessionOrderByWithRelationInput | BillingCheckoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BillingCheckoutSessions.
     */
    cursor?: BillingCheckoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BillingCheckoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BillingCheckoutSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BillingCheckoutSessions.
     */
    distinct?: BillingCheckoutSessionScalarFieldEnum | BillingCheckoutSessionScalarFieldEnum[]
  }

  /**
   * BillingCheckoutSession findFirstOrThrow
   */
  export type BillingCheckoutSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which BillingCheckoutSession to fetch.
     */
    where?: BillingCheckoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BillingCheckoutSessions to fetch.
     */
    orderBy?: BillingCheckoutSessionOrderByWithRelationInput | BillingCheckoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BillingCheckoutSessions.
     */
    cursor?: BillingCheckoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BillingCheckoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BillingCheckoutSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BillingCheckoutSessions.
     */
    distinct?: BillingCheckoutSessionScalarFieldEnum | BillingCheckoutSessionScalarFieldEnum[]
  }

  /**
   * BillingCheckoutSession findMany
   */
  export type BillingCheckoutSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which BillingCheckoutSessions to fetch.
     */
    where?: BillingCheckoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BillingCheckoutSessions to fetch.
     */
    orderBy?: BillingCheckoutSessionOrderByWithRelationInput | BillingCheckoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BillingCheckoutSessions.
     */
    cursor?: BillingCheckoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BillingCheckoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BillingCheckoutSessions.
     */
    skip?: number
    distinct?: BillingCheckoutSessionScalarFieldEnum | BillingCheckoutSessionScalarFieldEnum[]
  }

  /**
   * BillingCheckoutSession create
   */
  export type BillingCheckoutSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a BillingCheckoutSession.
     */
    data: XOR<BillingCheckoutSessionCreateInput, BillingCheckoutSessionUncheckedCreateInput>
  }

  /**
   * BillingCheckoutSession createMany
   */
  export type BillingCheckoutSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BillingCheckoutSessions.
     */
    data: BillingCheckoutSessionCreateManyInput | BillingCheckoutSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BillingCheckoutSession createManyAndReturn
   */
  export type BillingCheckoutSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * The data used to create many BillingCheckoutSessions.
     */
    data: BillingCheckoutSessionCreateManyInput | BillingCheckoutSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BillingCheckoutSession update
   */
  export type BillingCheckoutSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a BillingCheckoutSession.
     */
    data: XOR<BillingCheckoutSessionUpdateInput, BillingCheckoutSessionUncheckedUpdateInput>
    /**
     * Choose, which BillingCheckoutSession to update.
     */
    where: BillingCheckoutSessionWhereUniqueInput
  }

  /**
   * BillingCheckoutSession updateMany
   */
  export type BillingCheckoutSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BillingCheckoutSessions.
     */
    data: XOR<BillingCheckoutSessionUpdateManyMutationInput, BillingCheckoutSessionUncheckedUpdateManyInput>
    /**
     * Filter which BillingCheckoutSessions to update
     */
    where?: BillingCheckoutSessionWhereInput
    /**
     * Limit how many BillingCheckoutSessions to update.
     */
    limit?: number
  }

  /**
   * BillingCheckoutSession updateManyAndReturn
   */
  export type BillingCheckoutSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * The data used to update BillingCheckoutSessions.
     */
    data: XOR<BillingCheckoutSessionUpdateManyMutationInput, BillingCheckoutSessionUncheckedUpdateManyInput>
    /**
     * Filter which BillingCheckoutSessions to update
     */
    where?: BillingCheckoutSessionWhereInput
    /**
     * Limit how many BillingCheckoutSessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BillingCheckoutSession upsert
   */
  export type BillingCheckoutSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the BillingCheckoutSession to update in case it exists.
     */
    where: BillingCheckoutSessionWhereUniqueInput
    /**
     * In case the BillingCheckoutSession found by the `where` argument doesn't exist, create a new BillingCheckoutSession with this data.
     */
    create: XOR<BillingCheckoutSessionCreateInput, BillingCheckoutSessionUncheckedCreateInput>
    /**
     * In case the BillingCheckoutSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BillingCheckoutSessionUpdateInput, BillingCheckoutSessionUncheckedUpdateInput>
  }

  /**
   * BillingCheckoutSession delete
   */
  export type BillingCheckoutSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
    /**
     * Filter which BillingCheckoutSession to delete.
     */
    where: BillingCheckoutSessionWhereUniqueInput
  }

  /**
   * BillingCheckoutSession deleteMany
   */
  export type BillingCheckoutSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BillingCheckoutSessions to delete
     */
    where?: BillingCheckoutSessionWhereInput
    /**
     * Limit how many BillingCheckoutSessions to delete.
     */
    limit?: number
  }

  /**
   * BillingCheckoutSession without action
   */
  export type BillingCheckoutSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillingCheckoutSession
     */
    select?: BillingCheckoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillingCheckoutSession
     */
    omit?: BillingCheckoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillingCheckoutSessionInclude<ExtArgs> | null
  }


  /**
   * Model CustomPlan
   */

  export type AggregateCustomPlan = {
    _count: CustomPlanCountAggregateOutputType | null
    _min: CustomPlanMinAggregateOutputType | null
    _max: CustomPlanMaxAggregateOutputType | null
  }

  export type CustomPlanMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    name: string | null
    description: string | null
    monthlyVariantId: string | null
    yearlyVariantId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type CustomPlanMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    name: string | null
    description: string | null
    monthlyVariantId: string | null
    yearlyVariantId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type CustomPlanCountAggregateOutputType = {
    id: number
    organizationId: number
    name: number
    description: number
    monthlyVariantId: number
    yearlyVariantId: number
    limits: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type CustomPlanMinAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    description?: true
    monthlyVariantId?: true
    yearlyVariantId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type CustomPlanMaxAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    description?: true
    monthlyVariantId?: true
    yearlyVariantId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type CustomPlanCountAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    description?: true
    monthlyVariantId?: true
    yearlyVariantId?: true
    limits?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type CustomPlanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomPlan to aggregate.
     */
    where?: CustomPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomPlans to fetch.
     */
    orderBy?: CustomPlanOrderByWithRelationInput | CustomPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CustomPlans
    **/
    _count?: true | CustomPlanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomPlanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomPlanMaxAggregateInputType
  }

  export type GetCustomPlanAggregateType<T extends CustomPlanAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomPlan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomPlan[P]>
      : GetScalarType<T[P], AggregateCustomPlan[P]>
  }




  export type CustomPlanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomPlanWhereInput
    orderBy?: CustomPlanOrderByWithAggregationInput | CustomPlanOrderByWithAggregationInput[]
    by: CustomPlanScalarFieldEnum[] | CustomPlanScalarFieldEnum
    having?: CustomPlanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomPlanCountAggregateInputType | true
    _min?: CustomPlanMinAggregateInputType
    _max?: CustomPlanMaxAggregateInputType
  }

  export type CustomPlanGroupByOutputType = {
    id: string
    organizationId: string
    name: string
    description: string | null
    monthlyVariantId: string | null
    yearlyVariantId: string | null
    limits: JsonValue
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: CustomPlanCountAggregateOutputType | null
    _min: CustomPlanMinAggregateOutputType | null
    _max: CustomPlanMaxAggregateOutputType | null
  }

  type GetCustomPlanGroupByPayload<T extends CustomPlanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomPlanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomPlanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomPlanGroupByOutputType[P]>
            : GetScalarType<T[P], CustomPlanGroupByOutputType[P]>
        }
      >
    >


  export type CustomPlanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    description?: boolean
    monthlyVariantId?: boolean
    yearlyVariantId?: boolean
    limits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customPlan"]>

  export type CustomPlanSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    description?: boolean
    monthlyVariantId?: boolean
    yearlyVariantId?: boolean
    limits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customPlan"]>

  export type CustomPlanSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    description?: boolean
    monthlyVariantId?: boolean
    yearlyVariantId?: boolean
    limits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customPlan"]>

  export type CustomPlanSelectScalar = {
    id?: boolean
    organizationId?: boolean
    name?: boolean
    description?: boolean
    monthlyVariantId?: boolean
    yearlyVariantId?: boolean
    limits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type CustomPlanOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "name" | "description" | "monthlyVariantId" | "yearlyVariantId" | "limits" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["customPlan"]>
  export type CustomPlanInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type CustomPlanIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type CustomPlanIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $CustomPlanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CustomPlan"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      name: string
      description: string | null
      monthlyVariantId: string | null
      yearlyVariantId: string | null
      limits: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["customPlan"]>
    composites: {}
  }

  type CustomPlanGetPayload<S extends boolean | null | undefined | CustomPlanDefaultArgs> = $Result.GetResult<Prisma.$CustomPlanPayload, S>

  type CustomPlanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomPlanCountAggregateInputType | true
    }

  export interface CustomPlanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CustomPlan'], meta: { name: 'CustomPlan' } }
    /**
     * Find zero or one CustomPlan that matches the filter.
     * @param {CustomPlanFindUniqueArgs} args - Arguments to find a CustomPlan
     * @example
     * // Get one CustomPlan
     * const customPlan = await prisma.customPlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomPlanFindUniqueArgs>(args: SelectSubset<T, CustomPlanFindUniqueArgs<ExtArgs>>): Prisma__CustomPlanClient<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CustomPlan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomPlanFindUniqueOrThrowArgs} args - Arguments to find a CustomPlan
     * @example
     * // Get one CustomPlan
     * const customPlan = await prisma.customPlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomPlanFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomPlanClient<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomPlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomPlanFindFirstArgs} args - Arguments to find a CustomPlan
     * @example
     * // Get one CustomPlan
     * const customPlan = await prisma.customPlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomPlanFindFirstArgs>(args?: SelectSubset<T, CustomPlanFindFirstArgs<ExtArgs>>): Prisma__CustomPlanClient<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomPlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomPlanFindFirstOrThrowArgs} args - Arguments to find a CustomPlan
     * @example
     * // Get one CustomPlan
     * const customPlan = await prisma.customPlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomPlanFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomPlanClient<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CustomPlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomPlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CustomPlans
     * const customPlans = await prisma.customPlan.findMany()
     * 
     * // Get first 10 CustomPlans
     * const customPlans = await prisma.customPlan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customPlanWithIdOnly = await prisma.customPlan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomPlanFindManyArgs>(args?: SelectSubset<T, CustomPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CustomPlan.
     * @param {CustomPlanCreateArgs} args - Arguments to create a CustomPlan.
     * @example
     * // Create one CustomPlan
     * const CustomPlan = await prisma.customPlan.create({
     *   data: {
     *     // ... data to create a CustomPlan
     *   }
     * })
     * 
     */
    create<T extends CustomPlanCreateArgs>(args: SelectSubset<T, CustomPlanCreateArgs<ExtArgs>>): Prisma__CustomPlanClient<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CustomPlans.
     * @param {CustomPlanCreateManyArgs} args - Arguments to create many CustomPlans.
     * @example
     * // Create many CustomPlans
     * const customPlan = await prisma.customPlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomPlanCreateManyArgs>(args?: SelectSubset<T, CustomPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CustomPlans and returns the data saved in the database.
     * @param {CustomPlanCreateManyAndReturnArgs} args - Arguments to create many CustomPlans.
     * @example
     * // Create many CustomPlans
     * const customPlan = await prisma.customPlan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CustomPlans and only return the `id`
     * const customPlanWithIdOnly = await prisma.customPlan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomPlanCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CustomPlan.
     * @param {CustomPlanDeleteArgs} args - Arguments to delete one CustomPlan.
     * @example
     * // Delete one CustomPlan
     * const CustomPlan = await prisma.customPlan.delete({
     *   where: {
     *     // ... filter to delete one CustomPlan
     *   }
     * })
     * 
     */
    delete<T extends CustomPlanDeleteArgs>(args: SelectSubset<T, CustomPlanDeleteArgs<ExtArgs>>): Prisma__CustomPlanClient<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CustomPlan.
     * @param {CustomPlanUpdateArgs} args - Arguments to update one CustomPlan.
     * @example
     * // Update one CustomPlan
     * const customPlan = await prisma.customPlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomPlanUpdateArgs>(args: SelectSubset<T, CustomPlanUpdateArgs<ExtArgs>>): Prisma__CustomPlanClient<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CustomPlans.
     * @param {CustomPlanDeleteManyArgs} args - Arguments to filter CustomPlans to delete.
     * @example
     * // Delete a few CustomPlans
     * const { count } = await prisma.customPlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomPlanDeleteManyArgs>(args?: SelectSubset<T, CustomPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomPlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CustomPlans
     * const customPlan = await prisma.customPlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomPlanUpdateManyArgs>(args: SelectSubset<T, CustomPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomPlans and returns the data updated in the database.
     * @param {CustomPlanUpdateManyAndReturnArgs} args - Arguments to update many CustomPlans.
     * @example
     * // Update many CustomPlans
     * const customPlan = await prisma.customPlan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CustomPlans and only return the `id`
     * const customPlanWithIdOnly = await prisma.customPlan.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustomPlanUpdateManyAndReturnArgs>(args: SelectSubset<T, CustomPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CustomPlan.
     * @param {CustomPlanUpsertArgs} args - Arguments to update or create a CustomPlan.
     * @example
     * // Update or create a CustomPlan
     * const customPlan = await prisma.customPlan.upsert({
     *   create: {
     *     // ... data to create a CustomPlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CustomPlan we want to update
     *   }
     * })
     */
    upsert<T extends CustomPlanUpsertArgs>(args: SelectSubset<T, CustomPlanUpsertArgs<ExtArgs>>): Prisma__CustomPlanClient<$Result.GetResult<Prisma.$CustomPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CustomPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomPlanCountArgs} args - Arguments to filter CustomPlans to count.
     * @example
     * // Count the number of CustomPlans
     * const count = await prisma.customPlan.count({
     *   where: {
     *     // ... the filter for the CustomPlans we want to count
     *   }
     * })
    **/
    count<T extends CustomPlanCountArgs>(
      args?: Subset<T, CustomPlanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomPlanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CustomPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomPlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomPlanAggregateArgs>(args: Subset<T, CustomPlanAggregateArgs>): Prisma.PrismaPromise<GetCustomPlanAggregateType<T>>

    /**
     * Group by CustomPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomPlanGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomPlanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomPlanGroupByArgs['orderBy'] }
        : { orderBy?: CustomPlanGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CustomPlan model
   */
  readonly fields: CustomPlanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CustomPlan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomPlanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CustomPlan model
   */
  interface CustomPlanFieldRefs {
    readonly id: FieldRef<"CustomPlan", 'String'>
    readonly organizationId: FieldRef<"CustomPlan", 'String'>
    readonly name: FieldRef<"CustomPlan", 'String'>
    readonly description: FieldRef<"CustomPlan", 'String'>
    readonly monthlyVariantId: FieldRef<"CustomPlan", 'String'>
    readonly yearlyVariantId: FieldRef<"CustomPlan", 'String'>
    readonly limits: FieldRef<"CustomPlan", 'Json'>
    readonly createdAt: FieldRef<"CustomPlan", 'DateTime'>
    readonly updatedAt: FieldRef<"CustomPlan", 'DateTime'>
    readonly deletedAt: FieldRef<"CustomPlan", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CustomPlan findUnique
   */
  export type CustomPlanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
    /**
     * Filter, which CustomPlan to fetch.
     */
    where: CustomPlanWhereUniqueInput
  }

  /**
   * CustomPlan findUniqueOrThrow
   */
  export type CustomPlanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
    /**
     * Filter, which CustomPlan to fetch.
     */
    where: CustomPlanWhereUniqueInput
  }

  /**
   * CustomPlan findFirst
   */
  export type CustomPlanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
    /**
     * Filter, which CustomPlan to fetch.
     */
    where?: CustomPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomPlans to fetch.
     */
    orderBy?: CustomPlanOrderByWithRelationInput | CustomPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomPlans.
     */
    cursor?: CustomPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomPlans.
     */
    distinct?: CustomPlanScalarFieldEnum | CustomPlanScalarFieldEnum[]
  }

  /**
   * CustomPlan findFirstOrThrow
   */
  export type CustomPlanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
    /**
     * Filter, which CustomPlan to fetch.
     */
    where?: CustomPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomPlans to fetch.
     */
    orderBy?: CustomPlanOrderByWithRelationInput | CustomPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomPlans.
     */
    cursor?: CustomPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomPlans.
     */
    distinct?: CustomPlanScalarFieldEnum | CustomPlanScalarFieldEnum[]
  }

  /**
   * CustomPlan findMany
   */
  export type CustomPlanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
    /**
     * Filter, which CustomPlans to fetch.
     */
    where?: CustomPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomPlans to fetch.
     */
    orderBy?: CustomPlanOrderByWithRelationInput | CustomPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CustomPlans.
     */
    cursor?: CustomPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomPlans.
     */
    skip?: number
    distinct?: CustomPlanScalarFieldEnum | CustomPlanScalarFieldEnum[]
  }

  /**
   * CustomPlan create
   */
  export type CustomPlanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
    /**
     * The data needed to create a CustomPlan.
     */
    data: XOR<CustomPlanCreateInput, CustomPlanUncheckedCreateInput>
  }

  /**
   * CustomPlan createMany
   */
  export type CustomPlanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CustomPlans.
     */
    data: CustomPlanCreateManyInput | CustomPlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustomPlan createManyAndReturn
   */
  export type CustomPlanCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * The data used to create many CustomPlans.
     */
    data: CustomPlanCreateManyInput | CustomPlanCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CustomPlan update
   */
  export type CustomPlanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
    /**
     * The data needed to update a CustomPlan.
     */
    data: XOR<CustomPlanUpdateInput, CustomPlanUncheckedUpdateInput>
    /**
     * Choose, which CustomPlan to update.
     */
    where: CustomPlanWhereUniqueInput
  }

  /**
   * CustomPlan updateMany
   */
  export type CustomPlanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CustomPlans.
     */
    data: XOR<CustomPlanUpdateManyMutationInput, CustomPlanUncheckedUpdateManyInput>
    /**
     * Filter which CustomPlans to update
     */
    where?: CustomPlanWhereInput
    /**
     * Limit how many CustomPlans to update.
     */
    limit?: number
  }

  /**
   * CustomPlan updateManyAndReturn
   */
  export type CustomPlanUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * The data used to update CustomPlans.
     */
    data: XOR<CustomPlanUpdateManyMutationInput, CustomPlanUncheckedUpdateManyInput>
    /**
     * Filter which CustomPlans to update
     */
    where?: CustomPlanWhereInput
    /**
     * Limit how many CustomPlans to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CustomPlan upsert
   */
  export type CustomPlanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
    /**
     * The filter to search for the CustomPlan to update in case it exists.
     */
    where: CustomPlanWhereUniqueInput
    /**
     * In case the CustomPlan found by the `where` argument doesn't exist, create a new CustomPlan with this data.
     */
    create: XOR<CustomPlanCreateInput, CustomPlanUncheckedCreateInput>
    /**
     * In case the CustomPlan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomPlanUpdateInput, CustomPlanUncheckedUpdateInput>
  }

  /**
   * CustomPlan delete
   */
  export type CustomPlanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
    /**
     * Filter which CustomPlan to delete.
     */
    where: CustomPlanWhereUniqueInput
  }

  /**
   * CustomPlan deleteMany
   */
  export type CustomPlanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomPlans to delete
     */
    where?: CustomPlanWhereInput
    /**
     * Limit how many CustomPlans to delete.
     */
    limit?: number
  }

  /**
   * CustomPlan without action
   */
  export type CustomPlanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomPlan
     */
    select?: CustomPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomPlan
     */
    omit?: CustomPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomPlanInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const OrganizationScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    configuration: 'configuration'
  };

  export type OrganizationScalarFieldEnum = (typeof OrganizationScalarFieldEnum)[keyof typeof OrganizationScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    organizationId: 'organizationId',
    isOwner: 'isOwner',
    emailVerifiedAt: 'emailVerifiedAt',
    isBlocked: 'isBlocked',
    blockedAt: 'blockedAt',
    termsAcceptedAt: 'termsAcceptedAt',
    privacyAcceptedAt: 'privacyAcceptedAt',
    ageConfirmedAt: 'ageConfirmedAt',
    legalVersion: 'legalVersion',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const OrganizationInviteScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    email: 'email',
    tokenHash: 'tokenHash',
    expiresAt: 'expiresAt',
    createdByUserId: 'createdByUserId',
    acceptedAt: 'acceptedAt',
    revokedAt: 'revokedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrganizationInviteScalarFieldEnum = (typeof OrganizationInviteScalarFieldEnum)[keyof typeof OrganizationInviteScalarFieldEnum]


  export const DomainGroupScalarFieldEnum: {
    id: 'id',
    name: 'name',
    organizationId: 'organizationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type DomainGroupScalarFieldEnum = (typeof DomainGroupScalarFieldEnum)[keyof typeof DomainGroupScalarFieldEnum]


  export const DomainScalarFieldEnum: {
    id: 'id',
    name: 'name',
    domainGroupId: 'domainGroupId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type DomainScalarFieldEnum = (typeof DomainScalarFieldEnum)[keyof typeof DomainScalarFieldEnum]


  export const RedirectRuleScalarFieldEnum: {
    id: 'id',
    source: 'source',
    destination: 'destination',
    statusCode: 'statusCode',
    matchMethod: 'matchMethod',
    queryMatch: 'queryMatch',
    pathMatch: 'pathMatch',
    linkMapId: 'linkMapId',
    isBlocked: 'isBlocked',
    blockedAt: 'blockedAt',
    priority: 'priority',
    domainGroupId: 'domainGroupId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type RedirectRuleScalarFieldEnum = (typeof RedirectRuleScalarFieldEnum)[keyof typeof RedirectRuleScalarFieldEnum]


  export const LinkMapScalarFieldEnum: {
    id: 'id',
    name: 'name',
    domainGroupId: 'domainGroupId',
    caseSensitive: 'caseSensitive',
    queryMatch: 'queryMatch',
    fallbackDestination: 'fallbackDestination',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type LinkMapScalarFieldEnum = (typeof LinkMapScalarFieldEnum)[keyof typeof LinkMapScalarFieldEnum]


  export const LinkMapEntryScalarFieldEnum: {
    id: 'id',
    linkMapId: 'linkMapId',
    key: 'key',
    keyNormalized: 'keyNormalized',
    destination: 'destination',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type LinkMapEntryScalarFieldEnum = (typeof LinkMapEntryScalarFieldEnum)[keyof typeof LinkMapEntryScalarFieldEnum]


  export const RedirectRuleHitsHourlyScalarFieldEnum: {
    ruleId: 'ruleId',
    organizationId: 'organizationId',
    bucketStart: 'bucketStart',
    hits: 'hits',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RedirectRuleHitsHourlyScalarFieldEnum = (typeof RedirectRuleHitsHourlyScalarFieldEnum)[keyof typeof RedirectRuleHitsHourlyScalarFieldEnum]


  export const RedirectTestScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    domainGroupId: 'domainGroupId',
    pathWithQuery: 'pathWithQuery',
    requestData: 'requestData',
    expectedResult: 'expectedResult',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type RedirectTestScalarFieldEnum = (typeof RedirectTestScalarFieldEnum)[keyof typeof RedirectTestScalarFieldEnum]


  export const BillingCheckoutSessionScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    userId: 'userId',
    plan: 'plan',
    status: 'status',
    providerCheckoutId: 'providerCheckoutId',
    providerOrderId: 'providerOrderId',
    providerSubscriptionId: 'providerSubscriptionId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    completedAt: 'completedAt',
    metadata: 'metadata'
  };

  export type BillingCheckoutSessionScalarFieldEnum = (typeof BillingCheckoutSessionScalarFieldEnum)[keyof typeof BillingCheckoutSessionScalarFieldEnum]


  export const CustomPlanScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    name: 'name',
    description: 'description',
    monthlyVariantId: 'monthlyVariantId',
    yearlyVariantId: 'yearlyVariantId',
    limits: 'limits',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type CustomPlanScalarFieldEnum = (typeof CustomPlanScalarFieldEnum)[keyof typeof CustomPlanScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'HttpMethod[]'
   */
  export type ListEnumHttpMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HttpMethod[]'>
    


  /**
   * Reference to a field of type 'HttpMethod'
   */
  export type EnumHttpMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HttpMethod'>
    


  /**
   * Reference to a field of type 'RedirectQueryMatch'
   */
  export type EnumRedirectQueryMatchFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RedirectQueryMatch'>
    


  /**
   * Reference to a field of type 'RedirectQueryMatch[]'
   */
  export type ListEnumRedirectQueryMatchFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RedirectQueryMatch[]'>
    


  /**
   * Reference to a field of type 'RedirectPathMatch'
   */
  export type EnumRedirectPathMatchFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RedirectPathMatch'>
    


  /**
   * Reference to a field of type 'RedirectPathMatch[]'
   */
  export type ListEnumRedirectPathMatchFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RedirectPathMatch[]'>
    


  /**
   * Reference to a field of type 'BillingCheckoutStatus'
   */
  export type EnumBillingCheckoutStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BillingCheckoutStatus'>
    


  /**
   * Reference to a field of type 'BillingCheckoutStatus[]'
   */
  export type ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BillingCheckoutStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type OrganizationWhereInput = {
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    id?: StringFilter<"Organization"> | string
    name?: StringFilter<"Organization"> | string
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Organization"> | Date | string | null
    configuration?: JsonNullableFilter<"Organization">
    users?: UserListRelationFilter
    domainGroups?: DomainGroupListRelationFilter
    checkoutSessions?: BillingCheckoutSessionListRelationFilter
    customPlans?: CustomPlanListRelationFilter
    redirectTests?: RedirectTestListRelationFilter
    invites?: OrganizationInviteListRelationFilter
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyListRelationFilter
  }

  export type OrganizationOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    configuration?: SortOrderInput | SortOrder
    users?: UserOrderByRelationAggregateInput
    domainGroups?: DomainGroupOrderByRelationAggregateInput
    checkoutSessions?: BillingCheckoutSessionOrderByRelationAggregateInput
    customPlans?: CustomPlanOrderByRelationAggregateInput
    redirectTests?: RedirectTestOrderByRelationAggregateInput
    invites?: OrganizationInviteOrderByRelationAggregateInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyOrderByRelationAggregateInput
  }

  export type OrganizationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    name?: StringFilter<"Organization"> | string
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Organization"> | Date | string | null
    configuration?: JsonNullableFilter<"Organization">
    users?: UserListRelationFilter
    domainGroups?: DomainGroupListRelationFilter
    checkoutSessions?: BillingCheckoutSessionListRelationFilter
    customPlans?: CustomPlanListRelationFilter
    redirectTests?: RedirectTestListRelationFilter
    invites?: OrganizationInviteListRelationFilter
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyListRelationFilter
  }, "id">

  export type OrganizationOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    configuration?: SortOrderInput | SortOrder
    _count?: OrganizationCountOrderByAggregateInput
    _max?: OrganizationMaxOrderByAggregateInput
    _min?: OrganizationMinOrderByAggregateInput
  }

  export type OrganizationScalarWhereWithAggregatesInput = {
    AND?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    OR?: OrganizationScalarWhereWithAggregatesInput[]
    NOT?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Organization"> | string
    name?: StringWithAggregatesFilter<"Organization"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Organization"> | Date | string | null
    configuration?: JsonNullableWithAggregatesFilter<"Organization">
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    organizationId?: StringFilter<"User"> | string
    isOwner?: BoolFilter<"User"> | boolean
    emailVerifiedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isBlocked?: BoolFilter<"User"> | boolean
    blockedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    termsAcceptedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    privacyAcceptedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    ageConfirmedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    legalVersion?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    checkoutSessions?: BillingCheckoutSessionListRelationFilter
    createdInvites?: OrganizationInviteListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    organizationId?: SortOrder
    isOwner?: SortOrder
    emailVerifiedAt?: SortOrderInput | SortOrder
    isBlocked?: SortOrder
    blockedAt?: SortOrderInput | SortOrder
    termsAcceptedAt?: SortOrderInput | SortOrder
    privacyAcceptedAt?: SortOrderInput | SortOrder
    ageConfirmedAt?: SortOrderInput | SortOrder
    legalVersion?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    organization?: OrganizationOrderByWithRelationInput
    checkoutSessions?: BillingCheckoutSessionOrderByRelationAggregateInput
    createdInvites?: OrganizationInviteOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    passwordHash?: StringFilter<"User"> | string
    organizationId?: StringFilter<"User"> | string
    isOwner?: BoolFilter<"User"> | boolean
    emailVerifiedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isBlocked?: BoolFilter<"User"> | boolean
    blockedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    termsAcceptedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    privacyAcceptedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    ageConfirmedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    legalVersion?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    checkoutSessions?: BillingCheckoutSessionListRelationFilter
    createdInvites?: OrganizationInviteListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    organizationId?: SortOrder
    isOwner?: SortOrder
    emailVerifiedAt?: SortOrderInput | SortOrder
    isBlocked?: SortOrder
    blockedAt?: SortOrderInput | SortOrder
    termsAcceptedAt?: SortOrderInput | SortOrder
    privacyAcceptedAt?: SortOrderInput | SortOrder
    ageConfirmedAt?: SortOrderInput | SortOrder
    legalVersion?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    organizationId?: StringWithAggregatesFilter<"User"> | string
    isOwner?: BoolWithAggregatesFilter<"User"> | boolean
    emailVerifiedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    isBlocked?: BoolWithAggregatesFilter<"User"> | boolean
    blockedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    termsAcceptedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    privacyAcceptedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    ageConfirmedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    legalVersion?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
  }

  export type OrganizationInviteWhereInput = {
    AND?: OrganizationInviteWhereInput | OrganizationInviteWhereInput[]
    OR?: OrganizationInviteWhereInput[]
    NOT?: OrganizationInviteWhereInput | OrganizationInviteWhereInput[]
    id?: StringFilter<"OrganizationInvite"> | string
    organizationId?: StringFilter<"OrganizationInvite"> | string
    email?: StringFilter<"OrganizationInvite"> | string
    tokenHash?: StringFilter<"OrganizationInvite"> | string
    expiresAt?: DateTimeFilter<"OrganizationInvite"> | Date | string
    createdByUserId?: StringFilter<"OrganizationInvite"> | string
    acceptedAt?: DateTimeNullableFilter<"OrganizationInvite"> | Date | string | null
    revokedAt?: DateTimeNullableFilter<"OrganizationInvite"> | Date | string | null
    createdAt?: DateTimeFilter<"OrganizationInvite"> | Date | string
    updatedAt?: DateTimeFilter<"OrganizationInvite"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type OrganizationInviteOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    email?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    createdByUserId?: SortOrder
    acceptedAt?: SortOrderInput | SortOrder
    revokedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    createdBy?: UserOrderByWithRelationInput
  }

  export type OrganizationInviteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrganizationInviteWhereInput | OrganizationInviteWhereInput[]
    OR?: OrganizationInviteWhereInput[]
    NOT?: OrganizationInviteWhereInput | OrganizationInviteWhereInput[]
    organizationId?: StringFilter<"OrganizationInvite"> | string
    email?: StringFilter<"OrganizationInvite"> | string
    tokenHash?: StringFilter<"OrganizationInvite"> | string
    expiresAt?: DateTimeFilter<"OrganizationInvite"> | Date | string
    createdByUserId?: StringFilter<"OrganizationInvite"> | string
    acceptedAt?: DateTimeNullableFilter<"OrganizationInvite"> | Date | string | null
    revokedAt?: DateTimeNullableFilter<"OrganizationInvite"> | Date | string | null
    createdAt?: DateTimeFilter<"OrganizationInvite"> | Date | string
    updatedAt?: DateTimeFilter<"OrganizationInvite"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type OrganizationInviteOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    email?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    createdByUserId?: SortOrder
    acceptedAt?: SortOrderInput | SortOrder
    revokedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrganizationInviteCountOrderByAggregateInput
    _max?: OrganizationInviteMaxOrderByAggregateInput
    _min?: OrganizationInviteMinOrderByAggregateInput
  }

  export type OrganizationInviteScalarWhereWithAggregatesInput = {
    AND?: OrganizationInviteScalarWhereWithAggregatesInput | OrganizationInviteScalarWhereWithAggregatesInput[]
    OR?: OrganizationInviteScalarWhereWithAggregatesInput[]
    NOT?: OrganizationInviteScalarWhereWithAggregatesInput | OrganizationInviteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrganizationInvite"> | string
    organizationId?: StringWithAggregatesFilter<"OrganizationInvite"> | string
    email?: StringWithAggregatesFilter<"OrganizationInvite"> | string
    tokenHash?: StringWithAggregatesFilter<"OrganizationInvite"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"OrganizationInvite"> | Date | string
    createdByUserId?: StringWithAggregatesFilter<"OrganizationInvite"> | string
    acceptedAt?: DateTimeNullableWithAggregatesFilter<"OrganizationInvite"> | Date | string | null
    revokedAt?: DateTimeNullableWithAggregatesFilter<"OrganizationInvite"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OrganizationInvite"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OrganizationInvite"> | Date | string
  }

  export type DomainGroupWhereInput = {
    AND?: DomainGroupWhereInput | DomainGroupWhereInput[]
    OR?: DomainGroupWhereInput[]
    NOT?: DomainGroupWhereInput | DomainGroupWhereInput[]
    id?: StringFilter<"DomainGroup"> | string
    name?: StringFilter<"DomainGroup"> | string
    organizationId?: StringFilter<"DomainGroup"> | string
    createdAt?: DateTimeFilter<"DomainGroup"> | Date | string
    updatedAt?: DateTimeFilter<"DomainGroup"> | Date | string
    deletedAt?: DateTimeNullableFilter<"DomainGroup"> | Date | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    domains?: DomainListRelationFilter
    redirectRules?: RedirectRuleListRelationFilter
    linkMaps?: LinkMapListRelationFilter
    redirectTests?: RedirectTestListRelationFilter
  }

  export type DomainGroupOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    organizationId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    organization?: OrganizationOrderByWithRelationInput
    domains?: DomainOrderByRelationAggregateInput
    redirectRules?: RedirectRuleOrderByRelationAggregateInput
    linkMaps?: LinkMapOrderByRelationAggregateInput
    redirectTests?: RedirectTestOrderByRelationAggregateInput
  }

  export type DomainGroupWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DomainGroupWhereInput | DomainGroupWhereInput[]
    OR?: DomainGroupWhereInput[]
    NOT?: DomainGroupWhereInput | DomainGroupWhereInput[]
    name?: StringFilter<"DomainGroup"> | string
    organizationId?: StringFilter<"DomainGroup"> | string
    createdAt?: DateTimeFilter<"DomainGroup"> | Date | string
    updatedAt?: DateTimeFilter<"DomainGroup"> | Date | string
    deletedAt?: DateTimeNullableFilter<"DomainGroup"> | Date | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    domains?: DomainListRelationFilter
    redirectRules?: RedirectRuleListRelationFilter
    linkMaps?: LinkMapListRelationFilter
    redirectTests?: RedirectTestListRelationFilter
  }, "id">

  export type DomainGroupOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    organizationId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: DomainGroupCountOrderByAggregateInput
    _max?: DomainGroupMaxOrderByAggregateInput
    _min?: DomainGroupMinOrderByAggregateInput
  }

  export type DomainGroupScalarWhereWithAggregatesInput = {
    AND?: DomainGroupScalarWhereWithAggregatesInput | DomainGroupScalarWhereWithAggregatesInput[]
    OR?: DomainGroupScalarWhereWithAggregatesInput[]
    NOT?: DomainGroupScalarWhereWithAggregatesInput | DomainGroupScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DomainGroup"> | string
    name?: StringWithAggregatesFilter<"DomainGroup"> | string
    organizationId?: StringWithAggregatesFilter<"DomainGroup"> | string
    createdAt?: DateTimeWithAggregatesFilter<"DomainGroup"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DomainGroup"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"DomainGroup"> | Date | string | null
  }

  export type DomainWhereInput = {
    AND?: DomainWhereInput | DomainWhereInput[]
    OR?: DomainWhereInput[]
    NOT?: DomainWhereInput | DomainWhereInput[]
    id?: StringFilter<"Domain"> | string
    name?: StringFilter<"Domain"> | string
    domainGroupId?: StringFilter<"Domain"> | string
    createdAt?: DateTimeFilter<"Domain"> | Date | string
    updatedAt?: DateTimeFilter<"Domain"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Domain"> | Date | string | null
    domainGroup?: XOR<DomainGroupScalarRelationFilter, DomainGroupWhereInput>
  }

  export type DomainOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    domainGroup?: DomainGroupOrderByWithRelationInput
  }

  export type DomainWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DomainWhereInput | DomainWhereInput[]
    OR?: DomainWhereInput[]
    NOT?: DomainWhereInput | DomainWhereInput[]
    name?: StringFilter<"Domain"> | string
    domainGroupId?: StringFilter<"Domain"> | string
    createdAt?: DateTimeFilter<"Domain"> | Date | string
    updatedAt?: DateTimeFilter<"Domain"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Domain"> | Date | string | null
    domainGroup?: XOR<DomainGroupScalarRelationFilter, DomainGroupWhereInput>
  }, "id">

  export type DomainOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: DomainCountOrderByAggregateInput
    _max?: DomainMaxOrderByAggregateInput
    _min?: DomainMinOrderByAggregateInput
  }

  export type DomainScalarWhereWithAggregatesInput = {
    AND?: DomainScalarWhereWithAggregatesInput | DomainScalarWhereWithAggregatesInput[]
    OR?: DomainScalarWhereWithAggregatesInput[]
    NOT?: DomainScalarWhereWithAggregatesInput | DomainScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Domain"> | string
    name?: StringWithAggregatesFilter<"Domain"> | string
    domainGroupId?: StringWithAggregatesFilter<"Domain"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Domain"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Domain"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Domain"> | Date | string | null
  }

  export type RedirectRuleWhereInput = {
    AND?: RedirectRuleWhereInput | RedirectRuleWhereInput[]
    OR?: RedirectRuleWhereInput[]
    NOT?: RedirectRuleWhereInput | RedirectRuleWhereInput[]
    id?: StringFilter<"RedirectRule"> | string
    source?: StringFilter<"RedirectRule"> | string
    destination?: StringFilter<"RedirectRule"> | string
    statusCode?: IntFilter<"RedirectRule"> | number
    matchMethod?: EnumHttpMethodNullableListFilter<"RedirectRule">
    queryMatch?: EnumRedirectQueryMatchFilter<"RedirectRule"> | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFilter<"RedirectRule"> | $Enums.RedirectPathMatch
    linkMapId?: StringNullableFilter<"RedirectRule"> | string | null
    isBlocked?: BoolFilter<"RedirectRule"> | boolean
    blockedAt?: DateTimeNullableFilter<"RedirectRule"> | Date | string | null
    priority?: IntFilter<"RedirectRule"> | number
    domainGroupId?: StringFilter<"RedirectRule"> | string
    createdAt?: DateTimeFilter<"RedirectRule"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectRule"> | Date | string
    deletedAt?: DateTimeNullableFilter<"RedirectRule"> | Date | string | null
    domainGroup?: XOR<DomainGroupScalarRelationFilter, DomainGroupWhereInput>
    linkMap?: XOR<LinkMapNullableScalarRelationFilter, LinkMapWhereInput> | null
    hitsHourly?: RedirectRuleHitsHourlyListRelationFilter
  }

  export type RedirectRuleOrderByWithRelationInput = {
    id?: SortOrder
    source?: SortOrder
    destination?: SortOrder
    statusCode?: SortOrder
    matchMethod?: SortOrder
    queryMatch?: SortOrder
    pathMatch?: SortOrder
    linkMapId?: SortOrderInput | SortOrder
    isBlocked?: SortOrder
    blockedAt?: SortOrderInput | SortOrder
    priority?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    domainGroup?: DomainGroupOrderByWithRelationInput
    linkMap?: LinkMapOrderByWithRelationInput
    hitsHourly?: RedirectRuleHitsHourlyOrderByRelationAggregateInput
  }

  export type RedirectRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    priority_createdAt_id?: RedirectRulePriorityCreatedAtIdCompoundUniqueInput
    AND?: RedirectRuleWhereInput | RedirectRuleWhereInput[]
    OR?: RedirectRuleWhereInput[]
    NOT?: RedirectRuleWhereInput | RedirectRuleWhereInput[]
    source?: StringFilter<"RedirectRule"> | string
    destination?: StringFilter<"RedirectRule"> | string
    statusCode?: IntFilter<"RedirectRule"> | number
    matchMethod?: EnumHttpMethodNullableListFilter<"RedirectRule">
    queryMatch?: EnumRedirectQueryMatchFilter<"RedirectRule"> | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFilter<"RedirectRule"> | $Enums.RedirectPathMatch
    linkMapId?: StringNullableFilter<"RedirectRule"> | string | null
    isBlocked?: BoolFilter<"RedirectRule"> | boolean
    blockedAt?: DateTimeNullableFilter<"RedirectRule"> | Date | string | null
    priority?: IntFilter<"RedirectRule"> | number
    domainGroupId?: StringFilter<"RedirectRule"> | string
    createdAt?: DateTimeFilter<"RedirectRule"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectRule"> | Date | string
    deletedAt?: DateTimeNullableFilter<"RedirectRule"> | Date | string | null
    domainGroup?: XOR<DomainGroupScalarRelationFilter, DomainGroupWhereInput>
    linkMap?: XOR<LinkMapNullableScalarRelationFilter, LinkMapWhereInput> | null
    hitsHourly?: RedirectRuleHitsHourlyListRelationFilter
  }, "id" | "priority_createdAt_id">

  export type RedirectRuleOrderByWithAggregationInput = {
    id?: SortOrder
    source?: SortOrder
    destination?: SortOrder
    statusCode?: SortOrder
    matchMethod?: SortOrder
    queryMatch?: SortOrder
    pathMatch?: SortOrder
    linkMapId?: SortOrderInput | SortOrder
    isBlocked?: SortOrder
    blockedAt?: SortOrderInput | SortOrder
    priority?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: RedirectRuleCountOrderByAggregateInput
    _avg?: RedirectRuleAvgOrderByAggregateInput
    _max?: RedirectRuleMaxOrderByAggregateInput
    _min?: RedirectRuleMinOrderByAggregateInput
    _sum?: RedirectRuleSumOrderByAggregateInput
  }

  export type RedirectRuleScalarWhereWithAggregatesInput = {
    AND?: RedirectRuleScalarWhereWithAggregatesInput | RedirectRuleScalarWhereWithAggregatesInput[]
    OR?: RedirectRuleScalarWhereWithAggregatesInput[]
    NOT?: RedirectRuleScalarWhereWithAggregatesInput | RedirectRuleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RedirectRule"> | string
    source?: StringWithAggregatesFilter<"RedirectRule"> | string
    destination?: StringWithAggregatesFilter<"RedirectRule"> | string
    statusCode?: IntWithAggregatesFilter<"RedirectRule"> | number
    matchMethod?: EnumHttpMethodNullableListFilter<"RedirectRule">
    queryMatch?: EnumRedirectQueryMatchWithAggregatesFilter<"RedirectRule"> | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchWithAggregatesFilter<"RedirectRule"> | $Enums.RedirectPathMatch
    linkMapId?: StringNullableWithAggregatesFilter<"RedirectRule"> | string | null
    isBlocked?: BoolWithAggregatesFilter<"RedirectRule"> | boolean
    blockedAt?: DateTimeNullableWithAggregatesFilter<"RedirectRule"> | Date | string | null
    priority?: IntWithAggregatesFilter<"RedirectRule"> | number
    domainGroupId?: StringWithAggregatesFilter<"RedirectRule"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RedirectRule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RedirectRule"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"RedirectRule"> | Date | string | null
  }

  export type LinkMapWhereInput = {
    AND?: LinkMapWhereInput | LinkMapWhereInput[]
    OR?: LinkMapWhereInput[]
    NOT?: LinkMapWhereInput | LinkMapWhereInput[]
    id?: StringFilter<"LinkMap"> | string
    name?: StringFilter<"LinkMap"> | string
    domainGroupId?: StringFilter<"LinkMap"> | string
    caseSensitive?: BoolFilter<"LinkMap"> | boolean
    queryMatch?: EnumRedirectQueryMatchFilter<"LinkMap"> | $Enums.RedirectQueryMatch
    fallbackDestination?: StringNullableFilter<"LinkMap"> | string | null
    createdAt?: DateTimeFilter<"LinkMap"> | Date | string
    updatedAt?: DateTimeFilter<"LinkMap"> | Date | string
    deletedAt?: DateTimeNullableFilter<"LinkMap"> | Date | string | null
    domainGroup?: XOR<DomainGroupScalarRelationFilter, DomainGroupWhereInput>
    entries?: LinkMapEntryListRelationFilter
    redirectRules?: RedirectRuleListRelationFilter
  }

  export type LinkMapOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    domainGroupId?: SortOrder
    caseSensitive?: SortOrder
    queryMatch?: SortOrder
    fallbackDestination?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    domainGroup?: DomainGroupOrderByWithRelationInput
    entries?: LinkMapEntryOrderByRelationAggregateInput
    redirectRules?: RedirectRuleOrderByRelationAggregateInput
  }

  export type LinkMapWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LinkMapWhereInput | LinkMapWhereInput[]
    OR?: LinkMapWhereInput[]
    NOT?: LinkMapWhereInput | LinkMapWhereInput[]
    name?: StringFilter<"LinkMap"> | string
    domainGroupId?: StringFilter<"LinkMap"> | string
    caseSensitive?: BoolFilter<"LinkMap"> | boolean
    queryMatch?: EnumRedirectQueryMatchFilter<"LinkMap"> | $Enums.RedirectQueryMatch
    fallbackDestination?: StringNullableFilter<"LinkMap"> | string | null
    createdAt?: DateTimeFilter<"LinkMap"> | Date | string
    updatedAt?: DateTimeFilter<"LinkMap"> | Date | string
    deletedAt?: DateTimeNullableFilter<"LinkMap"> | Date | string | null
    domainGroup?: XOR<DomainGroupScalarRelationFilter, DomainGroupWhereInput>
    entries?: LinkMapEntryListRelationFilter
    redirectRules?: RedirectRuleListRelationFilter
  }, "id">

  export type LinkMapOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    domainGroupId?: SortOrder
    caseSensitive?: SortOrder
    queryMatch?: SortOrder
    fallbackDestination?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: LinkMapCountOrderByAggregateInput
    _max?: LinkMapMaxOrderByAggregateInput
    _min?: LinkMapMinOrderByAggregateInput
  }

  export type LinkMapScalarWhereWithAggregatesInput = {
    AND?: LinkMapScalarWhereWithAggregatesInput | LinkMapScalarWhereWithAggregatesInput[]
    OR?: LinkMapScalarWhereWithAggregatesInput[]
    NOT?: LinkMapScalarWhereWithAggregatesInput | LinkMapScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LinkMap"> | string
    name?: StringWithAggregatesFilter<"LinkMap"> | string
    domainGroupId?: StringWithAggregatesFilter<"LinkMap"> | string
    caseSensitive?: BoolWithAggregatesFilter<"LinkMap"> | boolean
    queryMatch?: EnumRedirectQueryMatchWithAggregatesFilter<"LinkMap"> | $Enums.RedirectQueryMatch
    fallbackDestination?: StringNullableWithAggregatesFilter<"LinkMap"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"LinkMap"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LinkMap"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"LinkMap"> | Date | string | null
  }

  export type LinkMapEntryWhereInput = {
    AND?: LinkMapEntryWhereInput | LinkMapEntryWhereInput[]
    OR?: LinkMapEntryWhereInput[]
    NOT?: LinkMapEntryWhereInput | LinkMapEntryWhereInput[]
    id?: StringFilter<"LinkMapEntry"> | string
    linkMapId?: StringFilter<"LinkMapEntry"> | string
    key?: StringFilter<"LinkMapEntry"> | string
    keyNormalized?: StringFilter<"LinkMapEntry"> | string
    destination?: StringFilter<"LinkMapEntry"> | string
    createdAt?: DateTimeFilter<"LinkMapEntry"> | Date | string
    updatedAt?: DateTimeFilter<"LinkMapEntry"> | Date | string
    deletedAt?: DateTimeNullableFilter<"LinkMapEntry"> | Date | string | null
    linkMap?: XOR<LinkMapScalarRelationFilter, LinkMapWhereInput>
  }

  export type LinkMapEntryOrderByWithRelationInput = {
    id?: SortOrder
    linkMapId?: SortOrder
    key?: SortOrder
    keyNormalized?: SortOrder
    destination?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    linkMap?: LinkMapOrderByWithRelationInput
  }

  export type LinkMapEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    linkMapId_keyNormalized?: LinkMapEntryLinkMapIdKeyNormalizedCompoundUniqueInput
    AND?: LinkMapEntryWhereInput | LinkMapEntryWhereInput[]
    OR?: LinkMapEntryWhereInput[]
    NOT?: LinkMapEntryWhereInput | LinkMapEntryWhereInput[]
    linkMapId?: StringFilter<"LinkMapEntry"> | string
    key?: StringFilter<"LinkMapEntry"> | string
    keyNormalized?: StringFilter<"LinkMapEntry"> | string
    destination?: StringFilter<"LinkMapEntry"> | string
    createdAt?: DateTimeFilter<"LinkMapEntry"> | Date | string
    updatedAt?: DateTimeFilter<"LinkMapEntry"> | Date | string
    deletedAt?: DateTimeNullableFilter<"LinkMapEntry"> | Date | string | null
    linkMap?: XOR<LinkMapScalarRelationFilter, LinkMapWhereInput>
  }, "id" | "linkMapId_keyNormalized">

  export type LinkMapEntryOrderByWithAggregationInput = {
    id?: SortOrder
    linkMapId?: SortOrder
    key?: SortOrder
    keyNormalized?: SortOrder
    destination?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: LinkMapEntryCountOrderByAggregateInput
    _max?: LinkMapEntryMaxOrderByAggregateInput
    _min?: LinkMapEntryMinOrderByAggregateInput
  }

  export type LinkMapEntryScalarWhereWithAggregatesInput = {
    AND?: LinkMapEntryScalarWhereWithAggregatesInput | LinkMapEntryScalarWhereWithAggregatesInput[]
    OR?: LinkMapEntryScalarWhereWithAggregatesInput[]
    NOT?: LinkMapEntryScalarWhereWithAggregatesInput | LinkMapEntryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LinkMapEntry"> | string
    linkMapId?: StringWithAggregatesFilter<"LinkMapEntry"> | string
    key?: StringWithAggregatesFilter<"LinkMapEntry"> | string
    keyNormalized?: StringWithAggregatesFilter<"LinkMapEntry"> | string
    destination?: StringWithAggregatesFilter<"LinkMapEntry"> | string
    createdAt?: DateTimeWithAggregatesFilter<"LinkMapEntry"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LinkMapEntry"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"LinkMapEntry"> | Date | string | null
  }

  export type RedirectRuleHitsHourlyWhereInput = {
    AND?: RedirectRuleHitsHourlyWhereInput | RedirectRuleHitsHourlyWhereInput[]
    OR?: RedirectRuleHitsHourlyWhereInput[]
    NOT?: RedirectRuleHitsHourlyWhereInput | RedirectRuleHitsHourlyWhereInput[]
    ruleId?: StringFilter<"RedirectRuleHitsHourly"> | string
    organizationId?: StringFilter<"RedirectRuleHitsHourly"> | string
    bucketStart?: DateTimeFilter<"RedirectRuleHitsHourly"> | Date | string
    hits?: IntFilter<"RedirectRuleHitsHourly"> | number
    createdAt?: DateTimeFilter<"RedirectRuleHitsHourly"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectRuleHitsHourly"> | Date | string
    redirectRule?: XOR<RedirectRuleScalarRelationFilter, RedirectRuleWhereInput>
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type RedirectRuleHitsHourlyOrderByWithRelationInput = {
    ruleId?: SortOrder
    organizationId?: SortOrder
    bucketStart?: SortOrder
    hits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    redirectRule?: RedirectRuleOrderByWithRelationInput
    organization?: OrganizationOrderByWithRelationInput
  }

  export type RedirectRuleHitsHourlyWhereUniqueInput = Prisma.AtLeast<{
    ruleId_organizationId_bucketStart?: RedirectRuleHitsHourlyRuleIdOrganizationIdBucketStartCompoundUniqueInput
    AND?: RedirectRuleHitsHourlyWhereInput | RedirectRuleHitsHourlyWhereInput[]
    OR?: RedirectRuleHitsHourlyWhereInput[]
    NOT?: RedirectRuleHitsHourlyWhereInput | RedirectRuleHitsHourlyWhereInput[]
    ruleId?: StringFilter<"RedirectRuleHitsHourly"> | string
    organizationId?: StringFilter<"RedirectRuleHitsHourly"> | string
    bucketStart?: DateTimeFilter<"RedirectRuleHitsHourly"> | Date | string
    hits?: IntFilter<"RedirectRuleHitsHourly"> | number
    createdAt?: DateTimeFilter<"RedirectRuleHitsHourly"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectRuleHitsHourly"> | Date | string
    redirectRule?: XOR<RedirectRuleScalarRelationFilter, RedirectRuleWhereInput>
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "ruleId_organizationId_bucketStart">

  export type RedirectRuleHitsHourlyOrderByWithAggregationInput = {
    ruleId?: SortOrder
    organizationId?: SortOrder
    bucketStart?: SortOrder
    hits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RedirectRuleHitsHourlyCountOrderByAggregateInput
    _avg?: RedirectRuleHitsHourlyAvgOrderByAggregateInput
    _max?: RedirectRuleHitsHourlyMaxOrderByAggregateInput
    _min?: RedirectRuleHitsHourlyMinOrderByAggregateInput
    _sum?: RedirectRuleHitsHourlySumOrderByAggregateInput
  }

  export type RedirectRuleHitsHourlyScalarWhereWithAggregatesInput = {
    AND?: RedirectRuleHitsHourlyScalarWhereWithAggregatesInput | RedirectRuleHitsHourlyScalarWhereWithAggregatesInput[]
    OR?: RedirectRuleHitsHourlyScalarWhereWithAggregatesInput[]
    NOT?: RedirectRuleHitsHourlyScalarWhereWithAggregatesInput | RedirectRuleHitsHourlyScalarWhereWithAggregatesInput[]
    ruleId?: StringWithAggregatesFilter<"RedirectRuleHitsHourly"> | string
    organizationId?: StringWithAggregatesFilter<"RedirectRuleHitsHourly"> | string
    bucketStart?: DateTimeWithAggregatesFilter<"RedirectRuleHitsHourly"> | Date | string
    hits?: IntWithAggregatesFilter<"RedirectRuleHitsHourly"> | number
    createdAt?: DateTimeWithAggregatesFilter<"RedirectRuleHitsHourly"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RedirectRuleHitsHourly"> | Date | string
  }

  export type RedirectTestWhereInput = {
    AND?: RedirectTestWhereInput | RedirectTestWhereInput[]
    OR?: RedirectTestWhereInput[]
    NOT?: RedirectTestWhereInput | RedirectTestWhereInput[]
    id?: StringFilter<"RedirectTest"> | string
    organizationId?: StringFilter<"RedirectTest"> | string
    domainGroupId?: StringFilter<"RedirectTest"> | string
    pathWithQuery?: StringFilter<"RedirectTest"> | string
    requestData?: JsonFilter<"RedirectTest">
    expectedResult?: JsonFilter<"RedirectTest">
    createdAt?: DateTimeFilter<"RedirectTest"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectTest"> | Date | string
    deletedAt?: DateTimeNullableFilter<"RedirectTest"> | Date | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    domainGroup?: XOR<DomainGroupScalarRelationFilter, DomainGroupWhereInput>
  }

  export type RedirectTestOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    domainGroupId?: SortOrder
    pathWithQuery?: SortOrder
    requestData?: SortOrder
    expectedResult?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    organization?: OrganizationOrderByWithRelationInput
    domainGroup?: DomainGroupOrderByWithRelationInput
  }

  export type RedirectTestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    createdAt_id?: RedirectTestCreatedAtIdCompoundUniqueInput
    AND?: RedirectTestWhereInput | RedirectTestWhereInput[]
    OR?: RedirectTestWhereInput[]
    NOT?: RedirectTestWhereInput | RedirectTestWhereInput[]
    organizationId?: StringFilter<"RedirectTest"> | string
    domainGroupId?: StringFilter<"RedirectTest"> | string
    pathWithQuery?: StringFilter<"RedirectTest"> | string
    requestData?: JsonFilter<"RedirectTest">
    expectedResult?: JsonFilter<"RedirectTest">
    createdAt?: DateTimeFilter<"RedirectTest"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectTest"> | Date | string
    deletedAt?: DateTimeNullableFilter<"RedirectTest"> | Date | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    domainGroup?: XOR<DomainGroupScalarRelationFilter, DomainGroupWhereInput>
  }, "id" | "createdAt_id">

  export type RedirectTestOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    domainGroupId?: SortOrder
    pathWithQuery?: SortOrder
    requestData?: SortOrder
    expectedResult?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: RedirectTestCountOrderByAggregateInput
    _max?: RedirectTestMaxOrderByAggregateInput
    _min?: RedirectTestMinOrderByAggregateInput
  }

  export type RedirectTestScalarWhereWithAggregatesInput = {
    AND?: RedirectTestScalarWhereWithAggregatesInput | RedirectTestScalarWhereWithAggregatesInput[]
    OR?: RedirectTestScalarWhereWithAggregatesInput[]
    NOT?: RedirectTestScalarWhereWithAggregatesInput | RedirectTestScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RedirectTest"> | string
    organizationId?: StringWithAggregatesFilter<"RedirectTest"> | string
    domainGroupId?: StringWithAggregatesFilter<"RedirectTest"> | string
    pathWithQuery?: StringWithAggregatesFilter<"RedirectTest"> | string
    requestData?: JsonWithAggregatesFilter<"RedirectTest">
    expectedResult?: JsonWithAggregatesFilter<"RedirectTest">
    createdAt?: DateTimeWithAggregatesFilter<"RedirectTest"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RedirectTest"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"RedirectTest"> | Date | string | null
  }

  export type BillingCheckoutSessionWhereInput = {
    AND?: BillingCheckoutSessionWhereInput | BillingCheckoutSessionWhereInput[]
    OR?: BillingCheckoutSessionWhereInput[]
    NOT?: BillingCheckoutSessionWhereInput | BillingCheckoutSessionWhereInput[]
    id?: StringFilter<"BillingCheckoutSession"> | string
    organizationId?: StringFilter<"BillingCheckoutSession"> | string
    userId?: StringFilter<"BillingCheckoutSession"> | string
    plan?: StringFilter<"BillingCheckoutSession"> | string
    status?: EnumBillingCheckoutStatusFilter<"BillingCheckoutSession"> | $Enums.BillingCheckoutStatus
    providerCheckoutId?: StringNullableFilter<"BillingCheckoutSession"> | string | null
    providerOrderId?: StringNullableFilter<"BillingCheckoutSession"> | string | null
    providerSubscriptionId?: StringNullableFilter<"BillingCheckoutSession"> | string | null
    createdAt?: DateTimeFilter<"BillingCheckoutSession"> | Date | string
    updatedAt?: DateTimeFilter<"BillingCheckoutSession"> | Date | string
    completedAt?: DateTimeNullableFilter<"BillingCheckoutSession"> | Date | string | null
    metadata?: JsonNullableFilter<"BillingCheckoutSession">
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type BillingCheckoutSessionOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    providerCheckoutId?: SortOrderInput | SortOrder
    providerOrderId?: SortOrderInput | SortOrder
    providerSubscriptionId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    organization?: OrganizationOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type BillingCheckoutSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BillingCheckoutSessionWhereInput | BillingCheckoutSessionWhereInput[]
    OR?: BillingCheckoutSessionWhereInput[]
    NOT?: BillingCheckoutSessionWhereInput | BillingCheckoutSessionWhereInput[]
    organizationId?: StringFilter<"BillingCheckoutSession"> | string
    userId?: StringFilter<"BillingCheckoutSession"> | string
    plan?: StringFilter<"BillingCheckoutSession"> | string
    status?: EnumBillingCheckoutStatusFilter<"BillingCheckoutSession"> | $Enums.BillingCheckoutStatus
    providerCheckoutId?: StringNullableFilter<"BillingCheckoutSession"> | string | null
    providerOrderId?: StringNullableFilter<"BillingCheckoutSession"> | string | null
    providerSubscriptionId?: StringNullableFilter<"BillingCheckoutSession"> | string | null
    createdAt?: DateTimeFilter<"BillingCheckoutSession"> | Date | string
    updatedAt?: DateTimeFilter<"BillingCheckoutSession"> | Date | string
    completedAt?: DateTimeNullableFilter<"BillingCheckoutSession"> | Date | string | null
    metadata?: JsonNullableFilter<"BillingCheckoutSession">
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type BillingCheckoutSessionOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    providerCheckoutId?: SortOrderInput | SortOrder
    providerOrderId?: SortOrderInput | SortOrder
    providerSubscriptionId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    _count?: BillingCheckoutSessionCountOrderByAggregateInput
    _max?: BillingCheckoutSessionMaxOrderByAggregateInput
    _min?: BillingCheckoutSessionMinOrderByAggregateInput
  }

  export type BillingCheckoutSessionScalarWhereWithAggregatesInput = {
    AND?: BillingCheckoutSessionScalarWhereWithAggregatesInput | BillingCheckoutSessionScalarWhereWithAggregatesInput[]
    OR?: BillingCheckoutSessionScalarWhereWithAggregatesInput[]
    NOT?: BillingCheckoutSessionScalarWhereWithAggregatesInput | BillingCheckoutSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BillingCheckoutSession"> | string
    organizationId?: StringWithAggregatesFilter<"BillingCheckoutSession"> | string
    userId?: StringWithAggregatesFilter<"BillingCheckoutSession"> | string
    plan?: StringWithAggregatesFilter<"BillingCheckoutSession"> | string
    status?: EnumBillingCheckoutStatusWithAggregatesFilter<"BillingCheckoutSession"> | $Enums.BillingCheckoutStatus
    providerCheckoutId?: StringNullableWithAggregatesFilter<"BillingCheckoutSession"> | string | null
    providerOrderId?: StringNullableWithAggregatesFilter<"BillingCheckoutSession"> | string | null
    providerSubscriptionId?: StringNullableWithAggregatesFilter<"BillingCheckoutSession"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"BillingCheckoutSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BillingCheckoutSession"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"BillingCheckoutSession"> | Date | string | null
    metadata?: JsonNullableWithAggregatesFilter<"BillingCheckoutSession">
  }

  export type CustomPlanWhereInput = {
    AND?: CustomPlanWhereInput | CustomPlanWhereInput[]
    OR?: CustomPlanWhereInput[]
    NOT?: CustomPlanWhereInput | CustomPlanWhereInput[]
    id?: StringFilter<"CustomPlan"> | string
    organizationId?: StringFilter<"CustomPlan"> | string
    name?: StringFilter<"CustomPlan"> | string
    description?: StringNullableFilter<"CustomPlan"> | string | null
    monthlyVariantId?: StringNullableFilter<"CustomPlan"> | string | null
    yearlyVariantId?: StringNullableFilter<"CustomPlan"> | string | null
    limits?: JsonFilter<"CustomPlan">
    createdAt?: DateTimeFilter<"CustomPlan"> | Date | string
    updatedAt?: DateTimeFilter<"CustomPlan"> | Date | string
    deletedAt?: DateTimeNullableFilter<"CustomPlan"> | Date | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type CustomPlanOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    monthlyVariantId?: SortOrderInput | SortOrder
    yearlyVariantId?: SortOrderInput | SortOrder
    limits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    organization?: OrganizationOrderByWithRelationInput
  }

  export type CustomPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CustomPlanWhereInput | CustomPlanWhereInput[]
    OR?: CustomPlanWhereInput[]
    NOT?: CustomPlanWhereInput | CustomPlanWhereInput[]
    organizationId?: StringFilter<"CustomPlan"> | string
    name?: StringFilter<"CustomPlan"> | string
    description?: StringNullableFilter<"CustomPlan"> | string | null
    monthlyVariantId?: StringNullableFilter<"CustomPlan"> | string | null
    yearlyVariantId?: StringNullableFilter<"CustomPlan"> | string | null
    limits?: JsonFilter<"CustomPlan">
    createdAt?: DateTimeFilter<"CustomPlan"> | Date | string
    updatedAt?: DateTimeFilter<"CustomPlan"> | Date | string
    deletedAt?: DateTimeNullableFilter<"CustomPlan"> | Date | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "id">

  export type CustomPlanOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    monthlyVariantId?: SortOrderInput | SortOrder
    yearlyVariantId?: SortOrderInput | SortOrder
    limits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: CustomPlanCountOrderByAggregateInput
    _max?: CustomPlanMaxOrderByAggregateInput
    _min?: CustomPlanMinOrderByAggregateInput
  }

  export type CustomPlanScalarWhereWithAggregatesInput = {
    AND?: CustomPlanScalarWhereWithAggregatesInput | CustomPlanScalarWhereWithAggregatesInput[]
    OR?: CustomPlanScalarWhereWithAggregatesInput[]
    NOT?: CustomPlanScalarWhereWithAggregatesInput | CustomPlanScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CustomPlan"> | string
    organizationId?: StringWithAggregatesFilter<"CustomPlan"> | string
    name?: StringWithAggregatesFilter<"CustomPlan"> | string
    description?: StringNullableWithAggregatesFilter<"CustomPlan"> | string | null
    monthlyVariantId?: StringNullableWithAggregatesFilter<"CustomPlan"> | string | null
    yearlyVariantId?: StringNullableWithAggregatesFilter<"CustomPlan"> | string | null
    limits?: JsonWithAggregatesFilter<"CustomPlan">
    createdAt?: DateTimeWithAggregatesFilter<"CustomPlan"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CustomPlan"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"CustomPlan"> | Date | string | null
  }

  export type OrganizationCreateInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupUncheckedCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanUncheckedCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteUncheckedCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUncheckedUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationCreateManyInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrganizationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrganizationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserCreateInput = {
    id: string
    email: string
    passwordHash: string
    isOwner?: boolean
    emailVerifiedAt?: Date | string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    termsAcceptedAt?: Date | string | null
    privacyAcceptedAt?: Date | string | null
    ageConfirmedAt?: Date | string | null
    legalVersion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutUsersInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutUserInput
    createdInvites?: OrganizationInviteCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateInput = {
    id: string
    email: string
    passwordHash: string
    organizationId: string
    isOwner?: boolean
    emailVerifiedAt?: Date | string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    termsAcceptedAt?: Date | string | null
    privacyAcceptedAt?: Date | string | null
    ageConfirmedAt?: Date | string | null
    legalVersion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutUserInput
    createdInvites?: OrganizationInviteUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutUserNestedInput
    createdInvites?: OrganizationInviteUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutUserNestedInput
    createdInvites?: OrganizationInviteUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type UserCreateManyInput = {
    id: string
    email: string
    passwordHash: string
    organizationId: string
    isOwner?: boolean
    emailVerifiedAt?: Date | string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    termsAcceptedAt?: Date | string | null
    privacyAcceptedAt?: Date | string | null
    ageConfirmedAt?: Date | string | null
    legalVersion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrganizationInviteCreateInput = {
    id: string
    email: string
    tokenHash: string
    expiresAt: Date | string
    acceptedAt?: Date | string | null
    revokedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutInvitesInput
    createdBy: UserCreateNestedOneWithoutCreatedInvitesInput
  }

  export type OrganizationInviteUncheckedCreateInput = {
    id: string
    organizationId: string
    email: string
    tokenHash: string
    expiresAt: Date | string
    createdByUserId: string
    acceptedAt?: Date | string | null
    revokedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationInviteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutInvitesNestedInput
    createdBy?: UserUpdateOneRequiredWithoutCreatedInvitesNestedInput
  }

  export type OrganizationInviteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdByUserId?: StringFieldUpdateOperationsInput | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationInviteCreateManyInput = {
    id: string
    organizationId: string
    email: string
    tokenHash: string
    expiresAt: Date | string
    createdByUserId: string
    acceptedAt?: Date | string | null
    revokedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationInviteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationInviteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdByUserId?: StringFieldUpdateOperationsInput | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DomainGroupCreateInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutDomainGroupsInput
    domains?: DomainCreateNestedManyWithoutDomainGroupInput
    redirectRules?: RedirectRuleCreateNestedManyWithoutDomainGroupInput
    linkMaps?: LinkMapCreateNestedManyWithoutDomainGroupInput
    redirectTests?: RedirectTestCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupUncheckedCreateInput = {
    id: string
    name: string
    organizationId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domains?: DomainUncheckedCreateNestedManyWithoutDomainGroupInput
    redirectRules?: RedirectRuleUncheckedCreateNestedManyWithoutDomainGroupInput
    linkMaps?: LinkMapUncheckedCreateNestedManyWithoutDomainGroupInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutDomainGroupsNestedInput
    domains?: DomainUpdateManyWithoutDomainGroupNestedInput
    redirectRules?: RedirectRuleUpdateManyWithoutDomainGroupNestedInput
    linkMaps?: LinkMapUpdateManyWithoutDomainGroupNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutDomainGroupNestedInput
  }

  export type DomainGroupUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domains?: DomainUncheckedUpdateManyWithoutDomainGroupNestedInput
    redirectRules?: RedirectRuleUncheckedUpdateManyWithoutDomainGroupNestedInput
    linkMaps?: LinkMapUncheckedUpdateManyWithoutDomainGroupNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutDomainGroupNestedInput
  }

  export type DomainGroupCreateManyInput = {
    id: string
    name: string
    organizationId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type DomainGroupUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DomainGroupUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DomainCreateInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domainGroup: DomainGroupCreateNestedOneWithoutDomainsInput
  }

  export type DomainUncheckedCreateInput = {
    id: string
    name: string
    domainGroupId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type DomainUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domainGroup?: DomainGroupUpdateOneRequiredWithoutDomainsNestedInput
  }

  export type DomainUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    domainGroupId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DomainCreateManyInput = {
    id: string
    name: string
    domainGroupId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type DomainUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DomainUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    domainGroupId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectRuleCreateInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domainGroup: DomainGroupCreateNestedOneWithoutRedirectRulesInput
    linkMap?: LinkMapCreateNestedOneWithoutRedirectRulesInput
    hitsHourly?: RedirectRuleHitsHourlyCreateNestedManyWithoutRedirectRuleInput
  }

  export type RedirectRuleUncheckedCreateInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    linkMapId?: string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    domainGroupId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    hitsHourly?: RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutRedirectRuleInput
  }

  export type RedirectRuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domainGroup?: DomainGroupUpdateOneRequiredWithoutRedirectRulesNestedInput
    linkMap?: LinkMapUpdateOneWithoutRedirectRulesNestedInput
    hitsHourly?: RedirectRuleHitsHourlyUpdateManyWithoutRedirectRuleNestedInput
  }

  export type RedirectRuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    linkMapId?: NullableStringFieldUpdateOperationsInput | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    domainGroupId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hitsHourly?: RedirectRuleHitsHourlyUncheckedUpdateManyWithoutRedirectRuleNestedInput
  }

  export type RedirectRuleCreateManyInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    linkMapId?: string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    domainGroupId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectRuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectRuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    linkMapId?: NullableStringFieldUpdateOperationsInput | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    domainGroupId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LinkMapCreateInput = {
    id: string
    name: string
    caseSensitive?: boolean
    queryMatch?: $Enums.RedirectQueryMatch
    fallbackDestination?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domainGroup: DomainGroupCreateNestedOneWithoutLinkMapsInput
    entries?: LinkMapEntryCreateNestedManyWithoutLinkMapInput
    redirectRules?: RedirectRuleCreateNestedManyWithoutLinkMapInput
  }

  export type LinkMapUncheckedCreateInput = {
    id: string
    name: string
    domainGroupId: string
    caseSensitive?: boolean
    queryMatch?: $Enums.RedirectQueryMatch
    fallbackDestination?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    entries?: LinkMapEntryUncheckedCreateNestedManyWithoutLinkMapInput
    redirectRules?: RedirectRuleUncheckedCreateNestedManyWithoutLinkMapInput
  }

  export type LinkMapUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domainGroup?: DomainGroupUpdateOneRequiredWithoutLinkMapsNestedInput
    entries?: LinkMapEntryUpdateManyWithoutLinkMapNestedInput
    redirectRules?: RedirectRuleUpdateManyWithoutLinkMapNestedInput
  }

  export type LinkMapUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    domainGroupId?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    entries?: LinkMapEntryUncheckedUpdateManyWithoutLinkMapNestedInput
    redirectRules?: RedirectRuleUncheckedUpdateManyWithoutLinkMapNestedInput
  }

  export type LinkMapCreateManyInput = {
    id: string
    name: string
    domainGroupId: string
    caseSensitive?: boolean
    queryMatch?: $Enums.RedirectQueryMatch
    fallbackDestination?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type LinkMapUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LinkMapUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    domainGroupId?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LinkMapEntryCreateInput = {
    id: string
    key: string
    keyNormalized: string
    destination: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    linkMap: LinkMapCreateNestedOneWithoutEntriesInput
  }

  export type LinkMapEntryUncheckedCreateInput = {
    id: string
    linkMapId: string
    key: string
    keyNormalized: string
    destination: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type LinkMapEntryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    keyNormalized?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    linkMap?: LinkMapUpdateOneRequiredWithoutEntriesNestedInput
  }

  export type LinkMapEntryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    linkMapId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    keyNormalized?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LinkMapEntryCreateManyInput = {
    id: string
    linkMapId: string
    key: string
    keyNormalized: string
    destination: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type LinkMapEntryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    keyNormalized?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LinkMapEntryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    linkMapId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    keyNormalized?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectRuleHitsHourlyCreateInput = {
    bucketStart: Date | string
    hits: number
    createdAt?: Date | string
    updatedAt?: Date | string
    redirectRule: RedirectRuleCreateNestedOneWithoutHitsHourlyInput
    organization: OrganizationCreateNestedOneWithoutRedirectRuleHitsHourlyInput
  }

  export type RedirectRuleHitsHourlyUncheckedCreateInput = {
    ruleId: string
    organizationId: string
    bucketStart: Date | string
    hits: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RedirectRuleHitsHourlyUpdateInput = {
    bucketStart?: DateTimeFieldUpdateOperationsInput | Date | string
    hits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    redirectRule?: RedirectRuleUpdateOneRequiredWithoutHitsHourlyNestedInput
    organization?: OrganizationUpdateOneRequiredWithoutRedirectRuleHitsHourlyNestedInput
  }

  export type RedirectRuleHitsHourlyUncheckedUpdateInput = {
    ruleId?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    bucketStart?: DateTimeFieldUpdateOperationsInput | Date | string
    hits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RedirectRuleHitsHourlyCreateManyInput = {
    ruleId: string
    organizationId: string
    bucketStart: Date | string
    hits: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RedirectRuleHitsHourlyUpdateManyMutationInput = {
    bucketStart?: DateTimeFieldUpdateOperationsInput | Date | string
    hits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RedirectRuleHitsHourlyUncheckedUpdateManyInput = {
    ruleId?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    bucketStart?: DateTimeFieldUpdateOperationsInput | Date | string
    hits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RedirectTestCreateInput = {
    id: string
    pathWithQuery: string
    requestData: JsonNullValueInput | InputJsonValue
    expectedResult: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutRedirectTestsInput
    domainGroup: DomainGroupCreateNestedOneWithoutRedirectTestsInput
  }

  export type RedirectTestUncheckedCreateInput = {
    id: string
    organizationId: string
    domainGroupId: string
    pathWithQuery: string
    requestData: JsonNullValueInput | InputJsonValue
    expectedResult: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectTestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pathWithQuery?: StringFieldUpdateOperationsInput | string
    requestData?: JsonNullValueInput | InputJsonValue
    expectedResult?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutRedirectTestsNestedInput
    domainGroup?: DomainGroupUpdateOneRequiredWithoutRedirectTestsNestedInput
  }

  export type RedirectTestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    domainGroupId?: StringFieldUpdateOperationsInput | string
    pathWithQuery?: StringFieldUpdateOperationsInput | string
    requestData?: JsonNullValueInput | InputJsonValue
    expectedResult?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectTestCreateManyInput = {
    id: string
    organizationId: string
    domainGroupId: string
    pathWithQuery: string
    requestData: JsonNullValueInput | InputJsonValue
    expectedResult: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectTestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    pathWithQuery?: StringFieldUpdateOperationsInput | string
    requestData?: JsonNullValueInput | InputJsonValue
    expectedResult?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectTestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    domainGroupId?: StringFieldUpdateOperationsInput | string
    pathWithQuery?: StringFieldUpdateOperationsInput | string
    requestData?: JsonNullValueInput | InputJsonValue
    expectedResult?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BillingCheckoutSessionCreateInput = {
    id: string
    plan: string
    status?: $Enums.BillingCheckoutStatus
    providerCheckoutId?: string | null
    providerOrderId?: string | null
    providerSubscriptionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    organization: OrganizationCreateNestedOneWithoutCheckoutSessionsInput
    user: UserCreateNestedOneWithoutCheckoutSessionsInput
  }

  export type BillingCheckoutSessionUncheckedCreateInput = {
    id: string
    organizationId: string
    userId: string
    plan: string
    status?: $Enums.BillingCheckoutStatus
    providerCheckoutId?: string | null
    providerOrderId?: string | null
    providerSubscriptionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BillingCheckoutSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: EnumBillingCheckoutStatusFieldUpdateOperationsInput | $Enums.BillingCheckoutStatus
    providerCheckoutId?: NullableStringFieldUpdateOperationsInput | string | null
    providerOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    organization?: OrganizationUpdateOneRequiredWithoutCheckoutSessionsNestedInput
    user?: UserUpdateOneRequiredWithoutCheckoutSessionsNestedInput
  }

  export type BillingCheckoutSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: EnumBillingCheckoutStatusFieldUpdateOperationsInput | $Enums.BillingCheckoutStatus
    providerCheckoutId?: NullableStringFieldUpdateOperationsInput | string | null
    providerOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BillingCheckoutSessionCreateManyInput = {
    id: string
    organizationId: string
    userId: string
    plan: string
    status?: $Enums.BillingCheckoutStatus
    providerCheckoutId?: string | null
    providerOrderId?: string | null
    providerSubscriptionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BillingCheckoutSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: EnumBillingCheckoutStatusFieldUpdateOperationsInput | $Enums.BillingCheckoutStatus
    providerCheckoutId?: NullableStringFieldUpdateOperationsInput | string | null
    providerOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BillingCheckoutSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: EnumBillingCheckoutStatusFieldUpdateOperationsInput | $Enums.BillingCheckoutStatus
    providerCheckoutId?: NullableStringFieldUpdateOperationsInput | string | null
    providerOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type CustomPlanCreateInput = {
    id: string
    name: string
    description?: string | null
    monthlyVariantId?: string | null
    yearlyVariantId?: string | null
    limits: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutCustomPlansInput
  }

  export type CustomPlanUncheckedCreateInput = {
    id: string
    organizationId: string
    name: string
    description?: string | null
    monthlyVariantId?: string | null
    yearlyVariantId?: string | null
    limits: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type CustomPlanUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    monthlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    limits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutCustomPlansNestedInput
  }

  export type CustomPlanUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    monthlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    limits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CustomPlanCreateManyInput = {
    id: string
    organizationId: string
    name: string
    description?: string | null
    monthlyVariantId?: string | null
    yearlyVariantId?: string | null
    limits: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type CustomPlanUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    monthlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    limits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CustomPlanUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    monthlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    limits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type DomainGroupListRelationFilter = {
    every?: DomainGroupWhereInput
    some?: DomainGroupWhereInput
    none?: DomainGroupWhereInput
  }

  export type BillingCheckoutSessionListRelationFilter = {
    every?: BillingCheckoutSessionWhereInput
    some?: BillingCheckoutSessionWhereInput
    none?: BillingCheckoutSessionWhereInput
  }

  export type CustomPlanListRelationFilter = {
    every?: CustomPlanWhereInput
    some?: CustomPlanWhereInput
    none?: CustomPlanWhereInput
  }

  export type RedirectTestListRelationFilter = {
    every?: RedirectTestWhereInput
    some?: RedirectTestWhereInput
    none?: RedirectTestWhereInput
  }

  export type OrganizationInviteListRelationFilter = {
    every?: OrganizationInviteWhereInput
    some?: OrganizationInviteWhereInput
    none?: OrganizationInviteWhereInput
  }

  export type RedirectRuleHitsHourlyListRelationFilter = {
    every?: RedirectRuleHitsHourlyWhereInput
    some?: RedirectRuleHitsHourlyWhereInput
    none?: RedirectRuleHitsHourlyWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DomainGroupOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BillingCheckoutSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustomPlanOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RedirectTestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrganizationInviteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RedirectRuleHitsHourlyOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrganizationCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    configuration?: SortOrder
  }

  export type OrganizationMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type OrganizationMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type OrganizationScalarRelationFilter = {
    is?: OrganizationWhereInput
    isNot?: OrganizationWhereInput
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    organizationId?: SortOrder
    isOwner?: SortOrder
    emailVerifiedAt?: SortOrder
    isBlocked?: SortOrder
    blockedAt?: SortOrder
    termsAcceptedAt?: SortOrder
    privacyAcceptedAt?: SortOrder
    ageConfirmedAt?: SortOrder
    legalVersion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    organizationId?: SortOrder
    isOwner?: SortOrder
    emailVerifiedAt?: SortOrder
    isBlocked?: SortOrder
    blockedAt?: SortOrder
    termsAcceptedAt?: SortOrder
    privacyAcceptedAt?: SortOrder
    ageConfirmedAt?: SortOrder
    legalVersion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    organizationId?: SortOrder
    isOwner?: SortOrder
    emailVerifiedAt?: SortOrder
    isBlocked?: SortOrder
    blockedAt?: SortOrder
    termsAcceptedAt?: SortOrder
    privacyAcceptedAt?: SortOrder
    ageConfirmedAt?: SortOrder
    legalVersion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type OrganizationInviteCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    email?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    createdByUserId?: SortOrder
    acceptedAt?: SortOrder
    revokedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationInviteMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    email?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    createdByUserId?: SortOrder
    acceptedAt?: SortOrder
    revokedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationInviteMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    email?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    createdByUserId?: SortOrder
    acceptedAt?: SortOrder
    revokedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DomainListRelationFilter = {
    every?: DomainWhereInput
    some?: DomainWhereInput
    none?: DomainWhereInput
  }

  export type RedirectRuleListRelationFilter = {
    every?: RedirectRuleWhereInput
    some?: RedirectRuleWhereInput
    none?: RedirectRuleWhereInput
  }

  export type LinkMapListRelationFilter = {
    every?: LinkMapWhereInput
    some?: LinkMapWhereInput
    none?: LinkMapWhereInput
  }

  export type DomainOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RedirectRuleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LinkMapOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DomainGroupCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    organizationId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type DomainGroupMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    organizationId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type DomainGroupMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    organizationId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type DomainGroupScalarRelationFilter = {
    is?: DomainGroupWhereInput
    isNot?: DomainGroupWhereInput
  }

  export type DomainCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type DomainMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type DomainMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumHttpMethodNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel> | null
    has?: $Enums.HttpMethod | EnumHttpMethodFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    hasSome?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type EnumRedirectQueryMatchFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectQueryMatch | EnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectQueryMatch[] | ListEnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectQueryMatch[] | ListEnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectQueryMatchFilter<$PrismaModel> | $Enums.RedirectQueryMatch
  }

  export type EnumRedirectPathMatchFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectPathMatch | EnumRedirectPathMatchFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectPathMatch[] | ListEnumRedirectPathMatchFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectPathMatch[] | ListEnumRedirectPathMatchFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectPathMatchFilter<$PrismaModel> | $Enums.RedirectPathMatch
  }

  export type LinkMapNullableScalarRelationFilter = {
    is?: LinkMapWhereInput | null
    isNot?: LinkMapWhereInput | null
  }

  export type RedirectRulePriorityCreatedAtIdCompoundUniqueInput = {
    priority: number
    createdAt: Date | string
    id: string
  }

  export type RedirectRuleCountOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    destination?: SortOrder
    statusCode?: SortOrder
    matchMethod?: SortOrder
    queryMatch?: SortOrder
    pathMatch?: SortOrder
    linkMapId?: SortOrder
    isBlocked?: SortOrder
    blockedAt?: SortOrder
    priority?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type RedirectRuleAvgOrderByAggregateInput = {
    statusCode?: SortOrder
    priority?: SortOrder
  }

  export type RedirectRuleMaxOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    destination?: SortOrder
    statusCode?: SortOrder
    queryMatch?: SortOrder
    pathMatch?: SortOrder
    linkMapId?: SortOrder
    isBlocked?: SortOrder
    blockedAt?: SortOrder
    priority?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type RedirectRuleMinOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    destination?: SortOrder
    statusCode?: SortOrder
    queryMatch?: SortOrder
    pathMatch?: SortOrder
    linkMapId?: SortOrder
    isBlocked?: SortOrder
    blockedAt?: SortOrder
    priority?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type RedirectRuleSumOrderByAggregateInput = {
    statusCode?: SortOrder
    priority?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumRedirectQueryMatchWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectQueryMatch | EnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectQueryMatch[] | ListEnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectQueryMatch[] | ListEnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectQueryMatchWithAggregatesFilter<$PrismaModel> | $Enums.RedirectQueryMatch
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRedirectQueryMatchFilter<$PrismaModel>
    _max?: NestedEnumRedirectQueryMatchFilter<$PrismaModel>
  }

  export type EnumRedirectPathMatchWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectPathMatch | EnumRedirectPathMatchFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectPathMatch[] | ListEnumRedirectPathMatchFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectPathMatch[] | ListEnumRedirectPathMatchFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectPathMatchWithAggregatesFilter<$PrismaModel> | $Enums.RedirectPathMatch
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRedirectPathMatchFilter<$PrismaModel>
    _max?: NestedEnumRedirectPathMatchFilter<$PrismaModel>
  }

  export type LinkMapEntryListRelationFilter = {
    every?: LinkMapEntryWhereInput
    some?: LinkMapEntryWhereInput
    none?: LinkMapEntryWhereInput
  }

  export type LinkMapEntryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LinkMapCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    domainGroupId?: SortOrder
    caseSensitive?: SortOrder
    queryMatch?: SortOrder
    fallbackDestination?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type LinkMapMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    domainGroupId?: SortOrder
    caseSensitive?: SortOrder
    queryMatch?: SortOrder
    fallbackDestination?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type LinkMapMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    domainGroupId?: SortOrder
    caseSensitive?: SortOrder
    queryMatch?: SortOrder
    fallbackDestination?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type LinkMapScalarRelationFilter = {
    is?: LinkMapWhereInput
    isNot?: LinkMapWhereInput
  }

  export type LinkMapEntryLinkMapIdKeyNormalizedCompoundUniqueInput = {
    linkMapId: string
    keyNormalized: string
  }

  export type LinkMapEntryCountOrderByAggregateInput = {
    id?: SortOrder
    linkMapId?: SortOrder
    key?: SortOrder
    keyNormalized?: SortOrder
    destination?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type LinkMapEntryMaxOrderByAggregateInput = {
    id?: SortOrder
    linkMapId?: SortOrder
    key?: SortOrder
    keyNormalized?: SortOrder
    destination?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type LinkMapEntryMinOrderByAggregateInput = {
    id?: SortOrder
    linkMapId?: SortOrder
    key?: SortOrder
    keyNormalized?: SortOrder
    destination?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type RedirectRuleScalarRelationFilter = {
    is?: RedirectRuleWhereInput
    isNot?: RedirectRuleWhereInput
  }

  export type RedirectRuleHitsHourlyRuleIdOrganizationIdBucketStartCompoundUniqueInput = {
    ruleId: string
    organizationId: string
    bucketStart: Date | string
  }

  export type RedirectRuleHitsHourlyCountOrderByAggregateInput = {
    ruleId?: SortOrder
    organizationId?: SortOrder
    bucketStart?: SortOrder
    hits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RedirectRuleHitsHourlyAvgOrderByAggregateInput = {
    hits?: SortOrder
  }

  export type RedirectRuleHitsHourlyMaxOrderByAggregateInput = {
    ruleId?: SortOrder
    organizationId?: SortOrder
    bucketStart?: SortOrder
    hits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RedirectRuleHitsHourlyMinOrderByAggregateInput = {
    ruleId?: SortOrder
    organizationId?: SortOrder
    bucketStart?: SortOrder
    hits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RedirectRuleHitsHourlySumOrderByAggregateInput = {
    hits?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type RedirectTestCreatedAtIdCompoundUniqueInput = {
    createdAt: Date | string
    id: string
  }

  export type RedirectTestCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    domainGroupId?: SortOrder
    pathWithQuery?: SortOrder
    requestData?: SortOrder
    expectedResult?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type RedirectTestMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    domainGroupId?: SortOrder
    pathWithQuery?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type RedirectTestMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    domainGroupId?: SortOrder
    pathWithQuery?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumBillingCheckoutStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCheckoutStatus | EnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCheckoutStatusFilter<$PrismaModel> | $Enums.BillingCheckoutStatus
  }

  export type BillingCheckoutSessionCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    providerCheckoutId?: SortOrder
    providerOrderId?: SortOrder
    providerSubscriptionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrder
    metadata?: SortOrder
  }

  export type BillingCheckoutSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    providerCheckoutId?: SortOrder
    providerOrderId?: SortOrder
    providerSubscriptionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type BillingCheckoutSessionMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    providerCheckoutId?: SortOrder
    providerOrderId?: SortOrder
    providerSubscriptionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type EnumBillingCheckoutStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCheckoutStatus | EnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCheckoutStatusWithAggregatesFilter<$PrismaModel> | $Enums.BillingCheckoutStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBillingCheckoutStatusFilter<$PrismaModel>
    _max?: NestedEnumBillingCheckoutStatusFilter<$PrismaModel>
  }

  export type CustomPlanCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    monthlyVariantId?: SortOrder
    yearlyVariantId?: SortOrder
    limits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type CustomPlanMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    monthlyVariantId?: SortOrder
    yearlyVariantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type CustomPlanMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    monthlyVariantId?: SortOrder
    yearlyVariantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type UserCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput> | UserCreateWithoutOrganizationInput[] | UserUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOrganizationInput | UserCreateOrConnectWithoutOrganizationInput[]
    createMany?: UserCreateManyOrganizationInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type DomainGroupCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<DomainGroupCreateWithoutOrganizationInput, DomainGroupUncheckedCreateWithoutOrganizationInput> | DomainGroupCreateWithoutOrganizationInput[] | DomainGroupUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: DomainGroupCreateOrConnectWithoutOrganizationInput | DomainGroupCreateOrConnectWithoutOrganizationInput[]
    createMany?: DomainGroupCreateManyOrganizationInputEnvelope
    connect?: DomainGroupWhereUniqueInput | DomainGroupWhereUniqueInput[]
  }

  export type BillingCheckoutSessionCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<BillingCheckoutSessionCreateWithoutOrganizationInput, BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput> | BillingCheckoutSessionCreateWithoutOrganizationInput[] | BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: BillingCheckoutSessionCreateOrConnectWithoutOrganizationInput | BillingCheckoutSessionCreateOrConnectWithoutOrganizationInput[]
    createMany?: BillingCheckoutSessionCreateManyOrganizationInputEnvelope
    connect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
  }

  export type CustomPlanCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<CustomPlanCreateWithoutOrganizationInput, CustomPlanUncheckedCreateWithoutOrganizationInput> | CustomPlanCreateWithoutOrganizationInput[] | CustomPlanUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: CustomPlanCreateOrConnectWithoutOrganizationInput | CustomPlanCreateOrConnectWithoutOrganizationInput[]
    createMany?: CustomPlanCreateManyOrganizationInputEnvelope
    connect?: CustomPlanWhereUniqueInput | CustomPlanWhereUniqueInput[]
  }

  export type RedirectTestCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<RedirectTestCreateWithoutOrganizationInput, RedirectTestUncheckedCreateWithoutOrganizationInput> | RedirectTestCreateWithoutOrganizationInput[] | RedirectTestUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RedirectTestCreateOrConnectWithoutOrganizationInput | RedirectTestCreateOrConnectWithoutOrganizationInput[]
    createMany?: RedirectTestCreateManyOrganizationInputEnvelope
    connect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
  }

  export type OrganizationInviteCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<OrganizationInviteCreateWithoutOrganizationInput, OrganizationInviteUncheckedCreateWithoutOrganizationInput> | OrganizationInviteCreateWithoutOrganizationInput[] | OrganizationInviteUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OrganizationInviteCreateOrConnectWithoutOrganizationInput | OrganizationInviteCreateOrConnectWithoutOrganizationInput[]
    createMany?: OrganizationInviteCreateManyOrganizationInputEnvelope
    connect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
  }

  export type RedirectRuleHitsHourlyCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<RedirectRuleHitsHourlyCreateWithoutOrganizationInput, RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput> | RedirectRuleHitsHourlyCreateWithoutOrganizationInput[] | RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RedirectRuleHitsHourlyCreateOrConnectWithoutOrganizationInput | RedirectRuleHitsHourlyCreateOrConnectWithoutOrganizationInput[]
    createMany?: RedirectRuleHitsHourlyCreateManyOrganizationInputEnvelope
    connect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput> | UserCreateWithoutOrganizationInput[] | UserUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOrganizationInput | UserCreateOrConnectWithoutOrganizationInput[]
    createMany?: UserCreateManyOrganizationInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type DomainGroupUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<DomainGroupCreateWithoutOrganizationInput, DomainGroupUncheckedCreateWithoutOrganizationInput> | DomainGroupCreateWithoutOrganizationInput[] | DomainGroupUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: DomainGroupCreateOrConnectWithoutOrganizationInput | DomainGroupCreateOrConnectWithoutOrganizationInput[]
    createMany?: DomainGroupCreateManyOrganizationInputEnvelope
    connect?: DomainGroupWhereUniqueInput | DomainGroupWhereUniqueInput[]
  }

  export type BillingCheckoutSessionUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<BillingCheckoutSessionCreateWithoutOrganizationInput, BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput> | BillingCheckoutSessionCreateWithoutOrganizationInput[] | BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: BillingCheckoutSessionCreateOrConnectWithoutOrganizationInput | BillingCheckoutSessionCreateOrConnectWithoutOrganizationInput[]
    createMany?: BillingCheckoutSessionCreateManyOrganizationInputEnvelope
    connect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
  }

  export type CustomPlanUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<CustomPlanCreateWithoutOrganizationInput, CustomPlanUncheckedCreateWithoutOrganizationInput> | CustomPlanCreateWithoutOrganizationInput[] | CustomPlanUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: CustomPlanCreateOrConnectWithoutOrganizationInput | CustomPlanCreateOrConnectWithoutOrganizationInput[]
    createMany?: CustomPlanCreateManyOrganizationInputEnvelope
    connect?: CustomPlanWhereUniqueInput | CustomPlanWhereUniqueInput[]
  }

  export type RedirectTestUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<RedirectTestCreateWithoutOrganizationInput, RedirectTestUncheckedCreateWithoutOrganizationInput> | RedirectTestCreateWithoutOrganizationInput[] | RedirectTestUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RedirectTestCreateOrConnectWithoutOrganizationInput | RedirectTestCreateOrConnectWithoutOrganizationInput[]
    createMany?: RedirectTestCreateManyOrganizationInputEnvelope
    connect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
  }

  export type OrganizationInviteUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<OrganizationInviteCreateWithoutOrganizationInput, OrganizationInviteUncheckedCreateWithoutOrganizationInput> | OrganizationInviteCreateWithoutOrganizationInput[] | OrganizationInviteUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OrganizationInviteCreateOrConnectWithoutOrganizationInput | OrganizationInviteCreateOrConnectWithoutOrganizationInput[]
    createMany?: OrganizationInviteCreateManyOrganizationInputEnvelope
    connect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
  }

  export type RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<RedirectRuleHitsHourlyCreateWithoutOrganizationInput, RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput> | RedirectRuleHitsHourlyCreateWithoutOrganizationInput[] | RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RedirectRuleHitsHourlyCreateOrConnectWithoutOrganizationInput | RedirectRuleHitsHourlyCreateOrConnectWithoutOrganizationInput[]
    createMany?: RedirectRuleHitsHourlyCreateManyOrganizationInputEnvelope
    connect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput> | UserCreateWithoutOrganizationInput[] | UserUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOrganizationInput | UserCreateOrConnectWithoutOrganizationInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutOrganizationInput | UserUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: UserCreateManyOrganizationInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutOrganizationInput | UserUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: UserUpdateManyWithWhereWithoutOrganizationInput | UserUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type DomainGroupUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<DomainGroupCreateWithoutOrganizationInput, DomainGroupUncheckedCreateWithoutOrganizationInput> | DomainGroupCreateWithoutOrganizationInput[] | DomainGroupUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: DomainGroupCreateOrConnectWithoutOrganizationInput | DomainGroupCreateOrConnectWithoutOrganizationInput[]
    upsert?: DomainGroupUpsertWithWhereUniqueWithoutOrganizationInput | DomainGroupUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: DomainGroupCreateManyOrganizationInputEnvelope
    set?: DomainGroupWhereUniqueInput | DomainGroupWhereUniqueInput[]
    disconnect?: DomainGroupWhereUniqueInput | DomainGroupWhereUniqueInput[]
    delete?: DomainGroupWhereUniqueInput | DomainGroupWhereUniqueInput[]
    connect?: DomainGroupWhereUniqueInput | DomainGroupWhereUniqueInput[]
    update?: DomainGroupUpdateWithWhereUniqueWithoutOrganizationInput | DomainGroupUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: DomainGroupUpdateManyWithWhereWithoutOrganizationInput | DomainGroupUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: DomainGroupScalarWhereInput | DomainGroupScalarWhereInput[]
  }

  export type BillingCheckoutSessionUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<BillingCheckoutSessionCreateWithoutOrganizationInput, BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput> | BillingCheckoutSessionCreateWithoutOrganizationInput[] | BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: BillingCheckoutSessionCreateOrConnectWithoutOrganizationInput | BillingCheckoutSessionCreateOrConnectWithoutOrganizationInput[]
    upsert?: BillingCheckoutSessionUpsertWithWhereUniqueWithoutOrganizationInput | BillingCheckoutSessionUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: BillingCheckoutSessionCreateManyOrganizationInputEnvelope
    set?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    disconnect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    delete?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    connect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    update?: BillingCheckoutSessionUpdateWithWhereUniqueWithoutOrganizationInput | BillingCheckoutSessionUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: BillingCheckoutSessionUpdateManyWithWhereWithoutOrganizationInput | BillingCheckoutSessionUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: BillingCheckoutSessionScalarWhereInput | BillingCheckoutSessionScalarWhereInput[]
  }

  export type CustomPlanUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<CustomPlanCreateWithoutOrganizationInput, CustomPlanUncheckedCreateWithoutOrganizationInput> | CustomPlanCreateWithoutOrganizationInput[] | CustomPlanUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: CustomPlanCreateOrConnectWithoutOrganizationInput | CustomPlanCreateOrConnectWithoutOrganizationInput[]
    upsert?: CustomPlanUpsertWithWhereUniqueWithoutOrganizationInput | CustomPlanUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: CustomPlanCreateManyOrganizationInputEnvelope
    set?: CustomPlanWhereUniqueInput | CustomPlanWhereUniqueInput[]
    disconnect?: CustomPlanWhereUniqueInput | CustomPlanWhereUniqueInput[]
    delete?: CustomPlanWhereUniqueInput | CustomPlanWhereUniqueInput[]
    connect?: CustomPlanWhereUniqueInput | CustomPlanWhereUniqueInput[]
    update?: CustomPlanUpdateWithWhereUniqueWithoutOrganizationInput | CustomPlanUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: CustomPlanUpdateManyWithWhereWithoutOrganizationInput | CustomPlanUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: CustomPlanScalarWhereInput | CustomPlanScalarWhereInput[]
  }

  export type RedirectTestUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<RedirectTestCreateWithoutOrganizationInput, RedirectTestUncheckedCreateWithoutOrganizationInput> | RedirectTestCreateWithoutOrganizationInput[] | RedirectTestUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RedirectTestCreateOrConnectWithoutOrganizationInput | RedirectTestCreateOrConnectWithoutOrganizationInput[]
    upsert?: RedirectTestUpsertWithWhereUniqueWithoutOrganizationInput | RedirectTestUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: RedirectTestCreateManyOrganizationInputEnvelope
    set?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    disconnect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    delete?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    connect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    update?: RedirectTestUpdateWithWhereUniqueWithoutOrganizationInput | RedirectTestUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: RedirectTestUpdateManyWithWhereWithoutOrganizationInput | RedirectTestUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: RedirectTestScalarWhereInput | RedirectTestScalarWhereInput[]
  }

  export type OrganizationInviteUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<OrganizationInviteCreateWithoutOrganizationInput, OrganizationInviteUncheckedCreateWithoutOrganizationInput> | OrganizationInviteCreateWithoutOrganizationInput[] | OrganizationInviteUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OrganizationInviteCreateOrConnectWithoutOrganizationInput | OrganizationInviteCreateOrConnectWithoutOrganizationInput[]
    upsert?: OrganizationInviteUpsertWithWhereUniqueWithoutOrganizationInput | OrganizationInviteUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: OrganizationInviteCreateManyOrganizationInputEnvelope
    set?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    disconnect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    delete?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    connect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    update?: OrganizationInviteUpdateWithWhereUniqueWithoutOrganizationInput | OrganizationInviteUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: OrganizationInviteUpdateManyWithWhereWithoutOrganizationInput | OrganizationInviteUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: OrganizationInviteScalarWhereInput | OrganizationInviteScalarWhereInput[]
  }

  export type RedirectRuleHitsHourlyUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<RedirectRuleHitsHourlyCreateWithoutOrganizationInput, RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput> | RedirectRuleHitsHourlyCreateWithoutOrganizationInput[] | RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RedirectRuleHitsHourlyCreateOrConnectWithoutOrganizationInput | RedirectRuleHitsHourlyCreateOrConnectWithoutOrganizationInput[]
    upsert?: RedirectRuleHitsHourlyUpsertWithWhereUniqueWithoutOrganizationInput | RedirectRuleHitsHourlyUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: RedirectRuleHitsHourlyCreateManyOrganizationInputEnvelope
    set?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    disconnect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    delete?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    connect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    update?: RedirectRuleHitsHourlyUpdateWithWhereUniqueWithoutOrganizationInput | RedirectRuleHitsHourlyUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: RedirectRuleHitsHourlyUpdateManyWithWhereWithoutOrganizationInput | RedirectRuleHitsHourlyUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: RedirectRuleHitsHourlyScalarWhereInput | RedirectRuleHitsHourlyScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput> | UserCreateWithoutOrganizationInput[] | UserUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOrganizationInput | UserCreateOrConnectWithoutOrganizationInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutOrganizationInput | UserUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: UserCreateManyOrganizationInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutOrganizationInput | UserUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: UserUpdateManyWithWhereWithoutOrganizationInput | UserUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type DomainGroupUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<DomainGroupCreateWithoutOrganizationInput, DomainGroupUncheckedCreateWithoutOrganizationInput> | DomainGroupCreateWithoutOrganizationInput[] | DomainGroupUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: DomainGroupCreateOrConnectWithoutOrganizationInput | DomainGroupCreateOrConnectWithoutOrganizationInput[]
    upsert?: DomainGroupUpsertWithWhereUniqueWithoutOrganizationInput | DomainGroupUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: DomainGroupCreateManyOrganizationInputEnvelope
    set?: DomainGroupWhereUniqueInput | DomainGroupWhereUniqueInput[]
    disconnect?: DomainGroupWhereUniqueInput | DomainGroupWhereUniqueInput[]
    delete?: DomainGroupWhereUniqueInput | DomainGroupWhereUniqueInput[]
    connect?: DomainGroupWhereUniqueInput | DomainGroupWhereUniqueInput[]
    update?: DomainGroupUpdateWithWhereUniqueWithoutOrganizationInput | DomainGroupUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: DomainGroupUpdateManyWithWhereWithoutOrganizationInput | DomainGroupUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: DomainGroupScalarWhereInput | DomainGroupScalarWhereInput[]
  }

  export type BillingCheckoutSessionUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<BillingCheckoutSessionCreateWithoutOrganizationInput, BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput> | BillingCheckoutSessionCreateWithoutOrganizationInput[] | BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: BillingCheckoutSessionCreateOrConnectWithoutOrganizationInput | BillingCheckoutSessionCreateOrConnectWithoutOrganizationInput[]
    upsert?: BillingCheckoutSessionUpsertWithWhereUniqueWithoutOrganizationInput | BillingCheckoutSessionUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: BillingCheckoutSessionCreateManyOrganizationInputEnvelope
    set?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    disconnect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    delete?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    connect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    update?: BillingCheckoutSessionUpdateWithWhereUniqueWithoutOrganizationInput | BillingCheckoutSessionUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: BillingCheckoutSessionUpdateManyWithWhereWithoutOrganizationInput | BillingCheckoutSessionUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: BillingCheckoutSessionScalarWhereInput | BillingCheckoutSessionScalarWhereInput[]
  }

  export type CustomPlanUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<CustomPlanCreateWithoutOrganizationInput, CustomPlanUncheckedCreateWithoutOrganizationInput> | CustomPlanCreateWithoutOrganizationInput[] | CustomPlanUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: CustomPlanCreateOrConnectWithoutOrganizationInput | CustomPlanCreateOrConnectWithoutOrganizationInput[]
    upsert?: CustomPlanUpsertWithWhereUniqueWithoutOrganizationInput | CustomPlanUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: CustomPlanCreateManyOrganizationInputEnvelope
    set?: CustomPlanWhereUniqueInput | CustomPlanWhereUniqueInput[]
    disconnect?: CustomPlanWhereUniqueInput | CustomPlanWhereUniqueInput[]
    delete?: CustomPlanWhereUniqueInput | CustomPlanWhereUniqueInput[]
    connect?: CustomPlanWhereUniqueInput | CustomPlanWhereUniqueInput[]
    update?: CustomPlanUpdateWithWhereUniqueWithoutOrganizationInput | CustomPlanUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: CustomPlanUpdateManyWithWhereWithoutOrganizationInput | CustomPlanUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: CustomPlanScalarWhereInput | CustomPlanScalarWhereInput[]
  }

  export type RedirectTestUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<RedirectTestCreateWithoutOrganizationInput, RedirectTestUncheckedCreateWithoutOrganizationInput> | RedirectTestCreateWithoutOrganizationInput[] | RedirectTestUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RedirectTestCreateOrConnectWithoutOrganizationInput | RedirectTestCreateOrConnectWithoutOrganizationInput[]
    upsert?: RedirectTestUpsertWithWhereUniqueWithoutOrganizationInput | RedirectTestUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: RedirectTestCreateManyOrganizationInputEnvelope
    set?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    disconnect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    delete?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    connect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    update?: RedirectTestUpdateWithWhereUniqueWithoutOrganizationInput | RedirectTestUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: RedirectTestUpdateManyWithWhereWithoutOrganizationInput | RedirectTestUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: RedirectTestScalarWhereInput | RedirectTestScalarWhereInput[]
  }

  export type OrganizationInviteUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<OrganizationInviteCreateWithoutOrganizationInput, OrganizationInviteUncheckedCreateWithoutOrganizationInput> | OrganizationInviteCreateWithoutOrganizationInput[] | OrganizationInviteUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OrganizationInviteCreateOrConnectWithoutOrganizationInput | OrganizationInviteCreateOrConnectWithoutOrganizationInput[]
    upsert?: OrganizationInviteUpsertWithWhereUniqueWithoutOrganizationInput | OrganizationInviteUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: OrganizationInviteCreateManyOrganizationInputEnvelope
    set?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    disconnect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    delete?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    connect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    update?: OrganizationInviteUpdateWithWhereUniqueWithoutOrganizationInput | OrganizationInviteUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: OrganizationInviteUpdateManyWithWhereWithoutOrganizationInput | OrganizationInviteUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: OrganizationInviteScalarWhereInput | OrganizationInviteScalarWhereInput[]
  }

  export type RedirectRuleHitsHourlyUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<RedirectRuleHitsHourlyCreateWithoutOrganizationInput, RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput> | RedirectRuleHitsHourlyCreateWithoutOrganizationInput[] | RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RedirectRuleHitsHourlyCreateOrConnectWithoutOrganizationInput | RedirectRuleHitsHourlyCreateOrConnectWithoutOrganizationInput[]
    upsert?: RedirectRuleHitsHourlyUpsertWithWhereUniqueWithoutOrganizationInput | RedirectRuleHitsHourlyUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: RedirectRuleHitsHourlyCreateManyOrganizationInputEnvelope
    set?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    disconnect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    delete?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    connect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    update?: RedirectRuleHitsHourlyUpdateWithWhereUniqueWithoutOrganizationInput | RedirectRuleHitsHourlyUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: RedirectRuleHitsHourlyUpdateManyWithWhereWithoutOrganizationInput | RedirectRuleHitsHourlyUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: RedirectRuleHitsHourlyScalarWhereInput | RedirectRuleHitsHourlyScalarWhereInput[]
  }

  export type OrganizationCreateNestedOneWithoutUsersInput = {
    create?: XOR<OrganizationCreateWithoutUsersInput, OrganizationUncheckedCreateWithoutUsersInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutUsersInput
    connect?: OrganizationWhereUniqueInput
  }

  export type BillingCheckoutSessionCreateNestedManyWithoutUserInput = {
    create?: XOR<BillingCheckoutSessionCreateWithoutUserInput, BillingCheckoutSessionUncheckedCreateWithoutUserInput> | BillingCheckoutSessionCreateWithoutUserInput[] | BillingCheckoutSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BillingCheckoutSessionCreateOrConnectWithoutUserInput | BillingCheckoutSessionCreateOrConnectWithoutUserInput[]
    createMany?: BillingCheckoutSessionCreateManyUserInputEnvelope
    connect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
  }

  export type OrganizationInviteCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<OrganizationInviteCreateWithoutCreatedByInput, OrganizationInviteUncheckedCreateWithoutCreatedByInput> | OrganizationInviteCreateWithoutCreatedByInput[] | OrganizationInviteUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: OrganizationInviteCreateOrConnectWithoutCreatedByInput | OrganizationInviteCreateOrConnectWithoutCreatedByInput[]
    createMany?: OrganizationInviteCreateManyCreatedByInputEnvelope
    connect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
  }

  export type BillingCheckoutSessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<BillingCheckoutSessionCreateWithoutUserInput, BillingCheckoutSessionUncheckedCreateWithoutUserInput> | BillingCheckoutSessionCreateWithoutUserInput[] | BillingCheckoutSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BillingCheckoutSessionCreateOrConnectWithoutUserInput | BillingCheckoutSessionCreateOrConnectWithoutUserInput[]
    createMany?: BillingCheckoutSessionCreateManyUserInputEnvelope
    connect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
  }

  export type OrganizationInviteUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<OrganizationInviteCreateWithoutCreatedByInput, OrganizationInviteUncheckedCreateWithoutCreatedByInput> | OrganizationInviteCreateWithoutCreatedByInput[] | OrganizationInviteUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: OrganizationInviteCreateOrConnectWithoutCreatedByInput | OrganizationInviteCreateOrConnectWithoutCreatedByInput[]
    createMany?: OrganizationInviteCreateManyCreatedByInputEnvelope
    connect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type OrganizationUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<OrganizationCreateWithoutUsersInput, OrganizationUncheckedCreateWithoutUsersInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutUsersInput
    upsert?: OrganizationUpsertWithoutUsersInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutUsersInput, OrganizationUpdateWithoutUsersInput>, OrganizationUncheckedUpdateWithoutUsersInput>
  }

  export type BillingCheckoutSessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<BillingCheckoutSessionCreateWithoutUserInput, BillingCheckoutSessionUncheckedCreateWithoutUserInput> | BillingCheckoutSessionCreateWithoutUserInput[] | BillingCheckoutSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BillingCheckoutSessionCreateOrConnectWithoutUserInput | BillingCheckoutSessionCreateOrConnectWithoutUserInput[]
    upsert?: BillingCheckoutSessionUpsertWithWhereUniqueWithoutUserInput | BillingCheckoutSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BillingCheckoutSessionCreateManyUserInputEnvelope
    set?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    disconnect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    delete?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    connect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    update?: BillingCheckoutSessionUpdateWithWhereUniqueWithoutUserInput | BillingCheckoutSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BillingCheckoutSessionUpdateManyWithWhereWithoutUserInput | BillingCheckoutSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BillingCheckoutSessionScalarWhereInput | BillingCheckoutSessionScalarWhereInput[]
  }

  export type OrganizationInviteUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<OrganizationInviteCreateWithoutCreatedByInput, OrganizationInviteUncheckedCreateWithoutCreatedByInput> | OrganizationInviteCreateWithoutCreatedByInput[] | OrganizationInviteUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: OrganizationInviteCreateOrConnectWithoutCreatedByInput | OrganizationInviteCreateOrConnectWithoutCreatedByInput[]
    upsert?: OrganizationInviteUpsertWithWhereUniqueWithoutCreatedByInput | OrganizationInviteUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: OrganizationInviteCreateManyCreatedByInputEnvelope
    set?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    disconnect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    delete?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    connect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    update?: OrganizationInviteUpdateWithWhereUniqueWithoutCreatedByInput | OrganizationInviteUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: OrganizationInviteUpdateManyWithWhereWithoutCreatedByInput | OrganizationInviteUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: OrganizationInviteScalarWhereInput | OrganizationInviteScalarWhereInput[]
  }

  export type BillingCheckoutSessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<BillingCheckoutSessionCreateWithoutUserInput, BillingCheckoutSessionUncheckedCreateWithoutUserInput> | BillingCheckoutSessionCreateWithoutUserInput[] | BillingCheckoutSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BillingCheckoutSessionCreateOrConnectWithoutUserInput | BillingCheckoutSessionCreateOrConnectWithoutUserInput[]
    upsert?: BillingCheckoutSessionUpsertWithWhereUniqueWithoutUserInput | BillingCheckoutSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BillingCheckoutSessionCreateManyUserInputEnvelope
    set?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    disconnect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    delete?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    connect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
    update?: BillingCheckoutSessionUpdateWithWhereUniqueWithoutUserInput | BillingCheckoutSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BillingCheckoutSessionUpdateManyWithWhereWithoutUserInput | BillingCheckoutSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BillingCheckoutSessionScalarWhereInput | BillingCheckoutSessionScalarWhereInput[]
  }

  export type OrganizationInviteUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<OrganizationInviteCreateWithoutCreatedByInput, OrganizationInviteUncheckedCreateWithoutCreatedByInput> | OrganizationInviteCreateWithoutCreatedByInput[] | OrganizationInviteUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: OrganizationInviteCreateOrConnectWithoutCreatedByInput | OrganizationInviteCreateOrConnectWithoutCreatedByInput[]
    upsert?: OrganizationInviteUpsertWithWhereUniqueWithoutCreatedByInput | OrganizationInviteUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: OrganizationInviteCreateManyCreatedByInputEnvelope
    set?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    disconnect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    delete?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    connect?: OrganizationInviteWhereUniqueInput | OrganizationInviteWhereUniqueInput[]
    update?: OrganizationInviteUpdateWithWhereUniqueWithoutCreatedByInput | OrganizationInviteUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: OrganizationInviteUpdateManyWithWhereWithoutCreatedByInput | OrganizationInviteUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: OrganizationInviteScalarWhereInput | OrganizationInviteScalarWhereInput[]
  }

  export type OrganizationCreateNestedOneWithoutInvitesInput = {
    create?: XOR<OrganizationCreateWithoutInvitesInput, OrganizationUncheckedCreateWithoutInvitesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutInvitesInput
    connect?: OrganizationWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutCreatedInvitesInput = {
    create?: XOR<UserCreateWithoutCreatedInvitesInput, UserUncheckedCreateWithoutCreatedInvitesInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedInvitesInput
    connect?: UserWhereUniqueInput
  }

  export type OrganizationUpdateOneRequiredWithoutInvitesNestedInput = {
    create?: XOR<OrganizationCreateWithoutInvitesInput, OrganizationUncheckedCreateWithoutInvitesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutInvitesInput
    upsert?: OrganizationUpsertWithoutInvitesInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutInvitesInput, OrganizationUpdateWithoutInvitesInput>, OrganizationUncheckedUpdateWithoutInvitesInput>
  }

  export type UserUpdateOneRequiredWithoutCreatedInvitesNestedInput = {
    create?: XOR<UserCreateWithoutCreatedInvitesInput, UserUncheckedCreateWithoutCreatedInvitesInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedInvitesInput
    upsert?: UserUpsertWithoutCreatedInvitesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCreatedInvitesInput, UserUpdateWithoutCreatedInvitesInput>, UserUncheckedUpdateWithoutCreatedInvitesInput>
  }

  export type OrganizationCreateNestedOneWithoutDomainGroupsInput = {
    create?: XOR<OrganizationCreateWithoutDomainGroupsInput, OrganizationUncheckedCreateWithoutDomainGroupsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutDomainGroupsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type DomainCreateNestedManyWithoutDomainGroupInput = {
    create?: XOR<DomainCreateWithoutDomainGroupInput, DomainUncheckedCreateWithoutDomainGroupInput> | DomainCreateWithoutDomainGroupInput[] | DomainUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: DomainCreateOrConnectWithoutDomainGroupInput | DomainCreateOrConnectWithoutDomainGroupInput[]
    createMany?: DomainCreateManyDomainGroupInputEnvelope
    connect?: DomainWhereUniqueInput | DomainWhereUniqueInput[]
  }

  export type RedirectRuleCreateNestedManyWithoutDomainGroupInput = {
    create?: XOR<RedirectRuleCreateWithoutDomainGroupInput, RedirectRuleUncheckedCreateWithoutDomainGroupInput> | RedirectRuleCreateWithoutDomainGroupInput[] | RedirectRuleUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: RedirectRuleCreateOrConnectWithoutDomainGroupInput | RedirectRuleCreateOrConnectWithoutDomainGroupInput[]
    createMany?: RedirectRuleCreateManyDomainGroupInputEnvelope
    connect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
  }

  export type LinkMapCreateNestedManyWithoutDomainGroupInput = {
    create?: XOR<LinkMapCreateWithoutDomainGroupInput, LinkMapUncheckedCreateWithoutDomainGroupInput> | LinkMapCreateWithoutDomainGroupInput[] | LinkMapUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: LinkMapCreateOrConnectWithoutDomainGroupInput | LinkMapCreateOrConnectWithoutDomainGroupInput[]
    createMany?: LinkMapCreateManyDomainGroupInputEnvelope
    connect?: LinkMapWhereUniqueInput | LinkMapWhereUniqueInput[]
  }

  export type RedirectTestCreateNestedManyWithoutDomainGroupInput = {
    create?: XOR<RedirectTestCreateWithoutDomainGroupInput, RedirectTestUncheckedCreateWithoutDomainGroupInput> | RedirectTestCreateWithoutDomainGroupInput[] | RedirectTestUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: RedirectTestCreateOrConnectWithoutDomainGroupInput | RedirectTestCreateOrConnectWithoutDomainGroupInput[]
    createMany?: RedirectTestCreateManyDomainGroupInputEnvelope
    connect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
  }

  export type DomainUncheckedCreateNestedManyWithoutDomainGroupInput = {
    create?: XOR<DomainCreateWithoutDomainGroupInput, DomainUncheckedCreateWithoutDomainGroupInput> | DomainCreateWithoutDomainGroupInput[] | DomainUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: DomainCreateOrConnectWithoutDomainGroupInput | DomainCreateOrConnectWithoutDomainGroupInput[]
    createMany?: DomainCreateManyDomainGroupInputEnvelope
    connect?: DomainWhereUniqueInput | DomainWhereUniqueInput[]
  }

  export type RedirectRuleUncheckedCreateNestedManyWithoutDomainGroupInput = {
    create?: XOR<RedirectRuleCreateWithoutDomainGroupInput, RedirectRuleUncheckedCreateWithoutDomainGroupInput> | RedirectRuleCreateWithoutDomainGroupInput[] | RedirectRuleUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: RedirectRuleCreateOrConnectWithoutDomainGroupInput | RedirectRuleCreateOrConnectWithoutDomainGroupInput[]
    createMany?: RedirectRuleCreateManyDomainGroupInputEnvelope
    connect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
  }

  export type LinkMapUncheckedCreateNestedManyWithoutDomainGroupInput = {
    create?: XOR<LinkMapCreateWithoutDomainGroupInput, LinkMapUncheckedCreateWithoutDomainGroupInput> | LinkMapCreateWithoutDomainGroupInput[] | LinkMapUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: LinkMapCreateOrConnectWithoutDomainGroupInput | LinkMapCreateOrConnectWithoutDomainGroupInput[]
    createMany?: LinkMapCreateManyDomainGroupInputEnvelope
    connect?: LinkMapWhereUniqueInput | LinkMapWhereUniqueInput[]
  }

  export type RedirectTestUncheckedCreateNestedManyWithoutDomainGroupInput = {
    create?: XOR<RedirectTestCreateWithoutDomainGroupInput, RedirectTestUncheckedCreateWithoutDomainGroupInput> | RedirectTestCreateWithoutDomainGroupInput[] | RedirectTestUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: RedirectTestCreateOrConnectWithoutDomainGroupInput | RedirectTestCreateOrConnectWithoutDomainGroupInput[]
    createMany?: RedirectTestCreateManyDomainGroupInputEnvelope
    connect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
  }

  export type OrganizationUpdateOneRequiredWithoutDomainGroupsNestedInput = {
    create?: XOR<OrganizationCreateWithoutDomainGroupsInput, OrganizationUncheckedCreateWithoutDomainGroupsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutDomainGroupsInput
    upsert?: OrganizationUpsertWithoutDomainGroupsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutDomainGroupsInput, OrganizationUpdateWithoutDomainGroupsInput>, OrganizationUncheckedUpdateWithoutDomainGroupsInput>
  }

  export type DomainUpdateManyWithoutDomainGroupNestedInput = {
    create?: XOR<DomainCreateWithoutDomainGroupInput, DomainUncheckedCreateWithoutDomainGroupInput> | DomainCreateWithoutDomainGroupInput[] | DomainUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: DomainCreateOrConnectWithoutDomainGroupInput | DomainCreateOrConnectWithoutDomainGroupInput[]
    upsert?: DomainUpsertWithWhereUniqueWithoutDomainGroupInput | DomainUpsertWithWhereUniqueWithoutDomainGroupInput[]
    createMany?: DomainCreateManyDomainGroupInputEnvelope
    set?: DomainWhereUniqueInput | DomainWhereUniqueInput[]
    disconnect?: DomainWhereUniqueInput | DomainWhereUniqueInput[]
    delete?: DomainWhereUniqueInput | DomainWhereUniqueInput[]
    connect?: DomainWhereUniqueInput | DomainWhereUniqueInput[]
    update?: DomainUpdateWithWhereUniqueWithoutDomainGroupInput | DomainUpdateWithWhereUniqueWithoutDomainGroupInput[]
    updateMany?: DomainUpdateManyWithWhereWithoutDomainGroupInput | DomainUpdateManyWithWhereWithoutDomainGroupInput[]
    deleteMany?: DomainScalarWhereInput | DomainScalarWhereInput[]
  }

  export type RedirectRuleUpdateManyWithoutDomainGroupNestedInput = {
    create?: XOR<RedirectRuleCreateWithoutDomainGroupInput, RedirectRuleUncheckedCreateWithoutDomainGroupInput> | RedirectRuleCreateWithoutDomainGroupInput[] | RedirectRuleUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: RedirectRuleCreateOrConnectWithoutDomainGroupInput | RedirectRuleCreateOrConnectWithoutDomainGroupInput[]
    upsert?: RedirectRuleUpsertWithWhereUniqueWithoutDomainGroupInput | RedirectRuleUpsertWithWhereUniqueWithoutDomainGroupInput[]
    createMany?: RedirectRuleCreateManyDomainGroupInputEnvelope
    set?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    disconnect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    delete?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    connect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    update?: RedirectRuleUpdateWithWhereUniqueWithoutDomainGroupInput | RedirectRuleUpdateWithWhereUniqueWithoutDomainGroupInput[]
    updateMany?: RedirectRuleUpdateManyWithWhereWithoutDomainGroupInput | RedirectRuleUpdateManyWithWhereWithoutDomainGroupInput[]
    deleteMany?: RedirectRuleScalarWhereInput | RedirectRuleScalarWhereInput[]
  }

  export type LinkMapUpdateManyWithoutDomainGroupNestedInput = {
    create?: XOR<LinkMapCreateWithoutDomainGroupInput, LinkMapUncheckedCreateWithoutDomainGroupInput> | LinkMapCreateWithoutDomainGroupInput[] | LinkMapUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: LinkMapCreateOrConnectWithoutDomainGroupInput | LinkMapCreateOrConnectWithoutDomainGroupInput[]
    upsert?: LinkMapUpsertWithWhereUniqueWithoutDomainGroupInput | LinkMapUpsertWithWhereUniqueWithoutDomainGroupInput[]
    createMany?: LinkMapCreateManyDomainGroupInputEnvelope
    set?: LinkMapWhereUniqueInput | LinkMapWhereUniqueInput[]
    disconnect?: LinkMapWhereUniqueInput | LinkMapWhereUniqueInput[]
    delete?: LinkMapWhereUniqueInput | LinkMapWhereUniqueInput[]
    connect?: LinkMapWhereUniqueInput | LinkMapWhereUniqueInput[]
    update?: LinkMapUpdateWithWhereUniqueWithoutDomainGroupInput | LinkMapUpdateWithWhereUniqueWithoutDomainGroupInput[]
    updateMany?: LinkMapUpdateManyWithWhereWithoutDomainGroupInput | LinkMapUpdateManyWithWhereWithoutDomainGroupInput[]
    deleteMany?: LinkMapScalarWhereInput | LinkMapScalarWhereInput[]
  }

  export type RedirectTestUpdateManyWithoutDomainGroupNestedInput = {
    create?: XOR<RedirectTestCreateWithoutDomainGroupInput, RedirectTestUncheckedCreateWithoutDomainGroupInput> | RedirectTestCreateWithoutDomainGroupInput[] | RedirectTestUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: RedirectTestCreateOrConnectWithoutDomainGroupInput | RedirectTestCreateOrConnectWithoutDomainGroupInput[]
    upsert?: RedirectTestUpsertWithWhereUniqueWithoutDomainGroupInput | RedirectTestUpsertWithWhereUniqueWithoutDomainGroupInput[]
    createMany?: RedirectTestCreateManyDomainGroupInputEnvelope
    set?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    disconnect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    delete?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    connect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    update?: RedirectTestUpdateWithWhereUniqueWithoutDomainGroupInput | RedirectTestUpdateWithWhereUniqueWithoutDomainGroupInput[]
    updateMany?: RedirectTestUpdateManyWithWhereWithoutDomainGroupInput | RedirectTestUpdateManyWithWhereWithoutDomainGroupInput[]
    deleteMany?: RedirectTestScalarWhereInput | RedirectTestScalarWhereInput[]
  }

  export type DomainUncheckedUpdateManyWithoutDomainGroupNestedInput = {
    create?: XOR<DomainCreateWithoutDomainGroupInput, DomainUncheckedCreateWithoutDomainGroupInput> | DomainCreateWithoutDomainGroupInput[] | DomainUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: DomainCreateOrConnectWithoutDomainGroupInput | DomainCreateOrConnectWithoutDomainGroupInput[]
    upsert?: DomainUpsertWithWhereUniqueWithoutDomainGroupInput | DomainUpsertWithWhereUniqueWithoutDomainGroupInput[]
    createMany?: DomainCreateManyDomainGroupInputEnvelope
    set?: DomainWhereUniqueInput | DomainWhereUniqueInput[]
    disconnect?: DomainWhereUniqueInput | DomainWhereUniqueInput[]
    delete?: DomainWhereUniqueInput | DomainWhereUniqueInput[]
    connect?: DomainWhereUniqueInput | DomainWhereUniqueInput[]
    update?: DomainUpdateWithWhereUniqueWithoutDomainGroupInput | DomainUpdateWithWhereUniqueWithoutDomainGroupInput[]
    updateMany?: DomainUpdateManyWithWhereWithoutDomainGroupInput | DomainUpdateManyWithWhereWithoutDomainGroupInput[]
    deleteMany?: DomainScalarWhereInput | DomainScalarWhereInput[]
  }

  export type RedirectRuleUncheckedUpdateManyWithoutDomainGroupNestedInput = {
    create?: XOR<RedirectRuleCreateWithoutDomainGroupInput, RedirectRuleUncheckedCreateWithoutDomainGroupInput> | RedirectRuleCreateWithoutDomainGroupInput[] | RedirectRuleUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: RedirectRuleCreateOrConnectWithoutDomainGroupInput | RedirectRuleCreateOrConnectWithoutDomainGroupInput[]
    upsert?: RedirectRuleUpsertWithWhereUniqueWithoutDomainGroupInput | RedirectRuleUpsertWithWhereUniqueWithoutDomainGroupInput[]
    createMany?: RedirectRuleCreateManyDomainGroupInputEnvelope
    set?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    disconnect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    delete?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    connect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    update?: RedirectRuleUpdateWithWhereUniqueWithoutDomainGroupInput | RedirectRuleUpdateWithWhereUniqueWithoutDomainGroupInput[]
    updateMany?: RedirectRuleUpdateManyWithWhereWithoutDomainGroupInput | RedirectRuleUpdateManyWithWhereWithoutDomainGroupInput[]
    deleteMany?: RedirectRuleScalarWhereInput | RedirectRuleScalarWhereInput[]
  }

  export type LinkMapUncheckedUpdateManyWithoutDomainGroupNestedInput = {
    create?: XOR<LinkMapCreateWithoutDomainGroupInput, LinkMapUncheckedCreateWithoutDomainGroupInput> | LinkMapCreateWithoutDomainGroupInput[] | LinkMapUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: LinkMapCreateOrConnectWithoutDomainGroupInput | LinkMapCreateOrConnectWithoutDomainGroupInput[]
    upsert?: LinkMapUpsertWithWhereUniqueWithoutDomainGroupInput | LinkMapUpsertWithWhereUniqueWithoutDomainGroupInput[]
    createMany?: LinkMapCreateManyDomainGroupInputEnvelope
    set?: LinkMapWhereUniqueInput | LinkMapWhereUniqueInput[]
    disconnect?: LinkMapWhereUniqueInput | LinkMapWhereUniqueInput[]
    delete?: LinkMapWhereUniqueInput | LinkMapWhereUniqueInput[]
    connect?: LinkMapWhereUniqueInput | LinkMapWhereUniqueInput[]
    update?: LinkMapUpdateWithWhereUniqueWithoutDomainGroupInput | LinkMapUpdateWithWhereUniqueWithoutDomainGroupInput[]
    updateMany?: LinkMapUpdateManyWithWhereWithoutDomainGroupInput | LinkMapUpdateManyWithWhereWithoutDomainGroupInput[]
    deleteMany?: LinkMapScalarWhereInput | LinkMapScalarWhereInput[]
  }

  export type RedirectTestUncheckedUpdateManyWithoutDomainGroupNestedInput = {
    create?: XOR<RedirectTestCreateWithoutDomainGroupInput, RedirectTestUncheckedCreateWithoutDomainGroupInput> | RedirectTestCreateWithoutDomainGroupInput[] | RedirectTestUncheckedCreateWithoutDomainGroupInput[]
    connectOrCreate?: RedirectTestCreateOrConnectWithoutDomainGroupInput | RedirectTestCreateOrConnectWithoutDomainGroupInput[]
    upsert?: RedirectTestUpsertWithWhereUniqueWithoutDomainGroupInput | RedirectTestUpsertWithWhereUniqueWithoutDomainGroupInput[]
    createMany?: RedirectTestCreateManyDomainGroupInputEnvelope
    set?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    disconnect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    delete?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    connect?: RedirectTestWhereUniqueInput | RedirectTestWhereUniqueInput[]
    update?: RedirectTestUpdateWithWhereUniqueWithoutDomainGroupInput | RedirectTestUpdateWithWhereUniqueWithoutDomainGroupInput[]
    updateMany?: RedirectTestUpdateManyWithWhereWithoutDomainGroupInput | RedirectTestUpdateManyWithWhereWithoutDomainGroupInput[]
    deleteMany?: RedirectTestScalarWhereInput | RedirectTestScalarWhereInput[]
  }

  export type DomainGroupCreateNestedOneWithoutDomainsInput = {
    create?: XOR<DomainGroupCreateWithoutDomainsInput, DomainGroupUncheckedCreateWithoutDomainsInput>
    connectOrCreate?: DomainGroupCreateOrConnectWithoutDomainsInput
    connect?: DomainGroupWhereUniqueInput
  }

  export type DomainGroupUpdateOneRequiredWithoutDomainsNestedInput = {
    create?: XOR<DomainGroupCreateWithoutDomainsInput, DomainGroupUncheckedCreateWithoutDomainsInput>
    connectOrCreate?: DomainGroupCreateOrConnectWithoutDomainsInput
    upsert?: DomainGroupUpsertWithoutDomainsInput
    connect?: DomainGroupWhereUniqueInput
    update?: XOR<XOR<DomainGroupUpdateToOneWithWhereWithoutDomainsInput, DomainGroupUpdateWithoutDomainsInput>, DomainGroupUncheckedUpdateWithoutDomainsInput>
  }

  export type RedirectRuleCreatematchMethodInput = {
    set: $Enums.HttpMethod[]
  }

  export type DomainGroupCreateNestedOneWithoutRedirectRulesInput = {
    create?: XOR<DomainGroupCreateWithoutRedirectRulesInput, DomainGroupUncheckedCreateWithoutRedirectRulesInput>
    connectOrCreate?: DomainGroupCreateOrConnectWithoutRedirectRulesInput
    connect?: DomainGroupWhereUniqueInput
  }

  export type LinkMapCreateNestedOneWithoutRedirectRulesInput = {
    create?: XOR<LinkMapCreateWithoutRedirectRulesInput, LinkMapUncheckedCreateWithoutRedirectRulesInput>
    connectOrCreate?: LinkMapCreateOrConnectWithoutRedirectRulesInput
    connect?: LinkMapWhereUniqueInput
  }

  export type RedirectRuleHitsHourlyCreateNestedManyWithoutRedirectRuleInput = {
    create?: XOR<RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput, RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput> | RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput[] | RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput[]
    connectOrCreate?: RedirectRuleHitsHourlyCreateOrConnectWithoutRedirectRuleInput | RedirectRuleHitsHourlyCreateOrConnectWithoutRedirectRuleInput[]
    createMany?: RedirectRuleHitsHourlyCreateManyRedirectRuleInputEnvelope
    connect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
  }

  export type RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutRedirectRuleInput = {
    create?: XOR<RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput, RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput> | RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput[] | RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput[]
    connectOrCreate?: RedirectRuleHitsHourlyCreateOrConnectWithoutRedirectRuleInput | RedirectRuleHitsHourlyCreateOrConnectWithoutRedirectRuleInput[]
    createMany?: RedirectRuleHitsHourlyCreateManyRedirectRuleInputEnvelope
    connect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type RedirectRuleUpdatematchMethodInput = {
    set?: $Enums.HttpMethod[]
    push?: $Enums.HttpMethod | $Enums.HttpMethod[]
  }

  export type EnumRedirectQueryMatchFieldUpdateOperationsInput = {
    set?: $Enums.RedirectQueryMatch
  }

  export type EnumRedirectPathMatchFieldUpdateOperationsInput = {
    set?: $Enums.RedirectPathMatch
  }

  export type DomainGroupUpdateOneRequiredWithoutRedirectRulesNestedInput = {
    create?: XOR<DomainGroupCreateWithoutRedirectRulesInput, DomainGroupUncheckedCreateWithoutRedirectRulesInput>
    connectOrCreate?: DomainGroupCreateOrConnectWithoutRedirectRulesInput
    upsert?: DomainGroupUpsertWithoutRedirectRulesInput
    connect?: DomainGroupWhereUniqueInput
    update?: XOR<XOR<DomainGroupUpdateToOneWithWhereWithoutRedirectRulesInput, DomainGroupUpdateWithoutRedirectRulesInput>, DomainGroupUncheckedUpdateWithoutRedirectRulesInput>
  }

  export type LinkMapUpdateOneWithoutRedirectRulesNestedInput = {
    create?: XOR<LinkMapCreateWithoutRedirectRulesInput, LinkMapUncheckedCreateWithoutRedirectRulesInput>
    connectOrCreate?: LinkMapCreateOrConnectWithoutRedirectRulesInput
    upsert?: LinkMapUpsertWithoutRedirectRulesInput
    disconnect?: LinkMapWhereInput | boolean
    delete?: LinkMapWhereInput | boolean
    connect?: LinkMapWhereUniqueInput
    update?: XOR<XOR<LinkMapUpdateToOneWithWhereWithoutRedirectRulesInput, LinkMapUpdateWithoutRedirectRulesInput>, LinkMapUncheckedUpdateWithoutRedirectRulesInput>
  }

  export type RedirectRuleHitsHourlyUpdateManyWithoutRedirectRuleNestedInput = {
    create?: XOR<RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput, RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput> | RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput[] | RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput[]
    connectOrCreate?: RedirectRuleHitsHourlyCreateOrConnectWithoutRedirectRuleInput | RedirectRuleHitsHourlyCreateOrConnectWithoutRedirectRuleInput[]
    upsert?: RedirectRuleHitsHourlyUpsertWithWhereUniqueWithoutRedirectRuleInput | RedirectRuleHitsHourlyUpsertWithWhereUniqueWithoutRedirectRuleInput[]
    createMany?: RedirectRuleHitsHourlyCreateManyRedirectRuleInputEnvelope
    set?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    disconnect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    delete?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    connect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    update?: RedirectRuleHitsHourlyUpdateWithWhereUniqueWithoutRedirectRuleInput | RedirectRuleHitsHourlyUpdateWithWhereUniqueWithoutRedirectRuleInput[]
    updateMany?: RedirectRuleHitsHourlyUpdateManyWithWhereWithoutRedirectRuleInput | RedirectRuleHitsHourlyUpdateManyWithWhereWithoutRedirectRuleInput[]
    deleteMany?: RedirectRuleHitsHourlyScalarWhereInput | RedirectRuleHitsHourlyScalarWhereInput[]
  }

  export type RedirectRuleHitsHourlyUncheckedUpdateManyWithoutRedirectRuleNestedInput = {
    create?: XOR<RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput, RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput> | RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput[] | RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput[]
    connectOrCreate?: RedirectRuleHitsHourlyCreateOrConnectWithoutRedirectRuleInput | RedirectRuleHitsHourlyCreateOrConnectWithoutRedirectRuleInput[]
    upsert?: RedirectRuleHitsHourlyUpsertWithWhereUniqueWithoutRedirectRuleInput | RedirectRuleHitsHourlyUpsertWithWhereUniqueWithoutRedirectRuleInput[]
    createMany?: RedirectRuleHitsHourlyCreateManyRedirectRuleInputEnvelope
    set?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    disconnect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    delete?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    connect?: RedirectRuleHitsHourlyWhereUniqueInput | RedirectRuleHitsHourlyWhereUniqueInput[]
    update?: RedirectRuleHitsHourlyUpdateWithWhereUniqueWithoutRedirectRuleInput | RedirectRuleHitsHourlyUpdateWithWhereUniqueWithoutRedirectRuleInput[]
    updateMany?: RedirectRuleHitsHourlyUpdateManyWithWhereWithoutRedirectRuleInput | RedirectRuleHitsHourlyUpdateManyWithWhereWithoutRedirectRuleInput[]
    deleteMany?: RedirectRuleHitsHourlyScalarWhereInput | RedirectRuleHitsHourlyScalarWhereInput[]
  }

  export type DomainGroupCreateNestedOneWithoutLinkMapsInput = {
    create?: XOR<DomainGroupCreateWithoutLinkMapsInput, DomainGroupUncheckedCreateWithoutLinkMapsInput>
    connectOrCreate?: DomainGroupCreateOrConnectWithoutLinkMapsInput
    connect?: DomainGroupWhereUniqueInput
  }

  export type LinkMapEntryCreateNestedManyWithoutLinkMapInput = {
    create?: XOR<LinkMapEntryCreateWithoutLinkMapInput, LinkMapEntryUncheckedCreateWithoutLinkMapInput> | LinkMapEntryCreateWithoutLinkMapInput[] | LinkMapEntryUncheckedCreateWithoutLinkMapInput[]
    connectOrCreate?: LinkMapEntryCreateOrConnectWithoutLinkMapInput | LinkMapEntryCreateOrConnectWithoutLinkMapInput[]
    createMany?: LinkMapEntryCreateManyLinkMapInputEnvelope
    connect?: LinkMapEntryWhereUniqueInput | LinkMapEntryWhereUniqueInput[]
  }

  export type RedirectRuleCreateNestedManyWithoutLinkMapInput = {
    create?: XOR<RedirectRuleCreateWithoutLinkMapInput, RedirectRuleUncheckedCreateWithoutLinkMapInput> | RedirectRuleCreateWithoutLinkMapInput[] | RedirectRuleUncheckedCreateWithoutLinkMapInput[]
    connectOrCreate?: RedirectRuleCreateOrConnectWithoutLinkMapInput | RedirectRuleCreateOrConnectWithoutLinkMapInput[]
    createMany?: RedirectRuleCreateManyLinkMapInputEnvelope
    connect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
  }

  export type LinkMapEntryUncheckedCreateNestedManyWithoutLinkMapInput = {
    create?: XOR<LinkMapEntryCreateWithoutLinkMapInput, LinkMapEntryUncheckedCreateWithoutLinkMapInput> | LinkMapEntryCreateWithoutLinkMapInput[] | LinkMapEntryUncheckedCreateWithoutLinkMapInput[]
    connectOrCreate?: LinkMapEntryCreateOrConnectWithoutLinkMapInput | LinkMapEntryCreateOrConnectWithoutLinkMapInput[]
    createMany?: LinkMapEntryCreateManyLinkMapInputEnvelope
    connect?: LinkMapEntryWhereUniqueInput | LinkMapEntryWhereUniqueInput[]
  }

  export type RedirectRuleUncheckedCreateNestedManyWithoutLinkMapInput = {
    create?: XOR<RedirectRuleCreateWithoutLinkMapInput, RedirectRuleUncheckedCreateWithoutLinkMapInput> | RedirectRuleCreateWithoutLinkMapInput[] | RedirectRuleUncheckedCreateWithoutLinkMapInput[]
    connectOrCreate?: RedirectRuleCreateOrConnectWithoutLinkMapInput | RedirectRuleCreateOrConnectWithoutLinkMapInput[]
    createMany?: RedirectRuleCreateManyLinkMapInputEnvelope
    connect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
  }

  export type DomainGroupUpdateOneRequiredWithoutLinkMapsNestedInput = {
    create?: XOR<DomainGroupCreateWithoutLinkMapsInput, DomainGroupUncheckedCreateWithoutLinkMapsInput>
    connectOrCreate?: DomainGroupCreateOrConnectWithoutLinkMapsInput
    upsert?: DomainGroupUpsertWithoutLinkMapsInput
    connect?: DomainGroupWhereUniqueInput
    update?: XOR<XOR<DomainGroupUpdateToOneWithWhereWithoutLinkMapsInput, DomainGroupUpdateWithoutLinkMapsInput>, DomainGroupUncheckedUpdateWithoutLinkMapsInput>
  }

  export type LinkMapEntryUpdateManyWithoutLinkMapNestedInput = {
    create?: XOR<LinkMapEntryCreateWithoutLinkMapInput, LinkMapEntryUncheckedCreateWithoutLinkMapInput> | LinkMapEntryCreateWithoutLinkMapInput[] | LinkMapEntryUncheckedCreateWithoutLinkMapInput[]
    connectOrCreate?: LinkMapEntryCreateOrConnectWithoutLinkMapInput | LinkMapEntryCreateOrConnectWithoutLinkMapInput[]
    upsert?: LinkMapEntryUpsertWithWhereUniqueWithoutLinkMapInput | LinkMapEntryUpsertWithWhereUniqueWithoutLinkMapInput[]
    createMany?: LinkMapEntryCreateManyLinkMapInputEnvelope
    set?: LinkMapEntryWhereUniqueInput | LinkMapEntryWhereUniqueInput[]
    disconnect?: LinkMapEntryWhereUniqueInput | LinkMapEntryWhereUniqueInput[]
    delete?: LinkMapEntryWhereUniqueInput | LinkMapEntryWhereUniqueInput[]
    connect?: LinkMapEntryWhereUniqueInput | LinkMapEntryWhereUniqueInput[]
    update?: LinkMapEntryUpdateWithWhereUniqueWithoutLinkMapInput | LinkMapEntryUpdateWithWhereUniqueWithoutLinkMapInput[]
    updateMany?: LinkMapEntryUpdateManyWithWhereWithoutLinkMapInput | LinkMapEntryUpdateManyWithWhereWithoutLinkMapInput[]
    deleteMany?: LinkMapEntryScalarWhereInput | LinkMapEntryScalarWhereInput[]
  }

  export type RedirectRuleUpdateManyWithoutLinkMapNestedInput = {
    create?: XOR<RedirectRuleCreateWithoutLinkMapInput, RedirectRuleUncheckedCreateWithoutLinkMapInput> | RedirectRuleCreateWithoutLinkMapInput[] | RedirectRuleUncheckedCreateWithoutLinkMapInput[]
    connectOrCreate?: RedirectRuleCreateOrConnectWithoutLinkMapInput | RedirectRuleCreateOrConnectWithoutLinkMapInput[]
    upsert?: RedirectRuleUpsertWithWhereUniqueWithoutLinkMapInput | RedirectRuleUpsertWithWhereUniqueWithoutLinkMapInput[]
    createMany?: RedirectRuleCreateManyLinkMapInputEnvelope
    set?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    disconnect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    delete?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    connect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    update?: RedirectRuleUpdateWithWhereUniqueWithoutLinkMapInput | RedirectRuleUpdateWithWhereUniqueWithoutLinkMapInput[]
    updateMany?: RedirectRuleUpdateManyWithWhereWithoutLinkMapInput | RedirectRuleUpdateManyWithWhereWithoutLinkMapInput[]
    deleteMany?: RedirectRuleScalarWhereInput | RedirectRuleScalarWhereInput[]
  }

  export type LinkMapEntryUncheckedUpdateManyWithoutLinkMapNestedInput = {
    create?: XOR<LinkMapEntryCreateWithoutLinkMapInput, LinkMapEntryUncheckedCreateWithoutLinkMapInput> | LinkMapEntryCreateWithoutLinkMapInput[] | LinkMapEntryUncheckedCreateWithoutLinkMapInput[]
    connectOrCreate?: LinkMapEntryCreateOrConnectWithoutLinkMapInput | LinkMapEntryCreateOrConnectWithoutLinkMapInput[]
    upsert?: LinkMapEntryUpsertWithWhereUniqueWithoutLinkMapInput | LinkMapEntryUpsertWithWhereUniqueWithoutLinkMapInput[]
    createMany?: LinkMapEntryCreateManyLinkMapInputEnvelope
    set?: LinkMapEntryWhereUniqueInput | LinkMapEntryWhereUniqueInput[]
    disconnect?: LinkMapEntryWhereUniqueInput | LinkMapEntryWhereUniqueInput[]
    delete?: LinkMapEntryWhereUniqueInput | LinkMapEntryWhereUniqueInput[]
    connect?: LinkMapEntryWhereUniqueInput | LinkMapEntryWhereUniqueInput[]
    update?: LinkMapEntryUpdateWithWhereUniqueWithoutLinkMapInput | LinkMapEntryUpdateWithWhereUniqueWithoutLinkMapInput[]
    updateMany?: LinkMapEntryUpdateManyWithWhereWithoutLinkMapInput | LinkMapEntryUpdateManyWithWhereWithoutLinkMapInput[]
    deleteMany?: LinkMapEntryScalarWhereInput | LinkMapEntryScalarWhereInput[]
  }

  export type RedirectRuleUncheckedUpdateManyWithoutLinkMapNestedInput = {
    create?: XOR<RedirectRuleCreateWithoutLinkMapInput, RedirectRuleUncheckedCreateWithoutLinkMapInput> | RedirectRuleCreateWithoutLinkMapInput[] | RedirectRuleUncheckedCreateWithoutLinkMapInput[]
    connectOrCreate?: RedirectRuleCreateOrConnectWithoutLinkMapInput | RedirectRuleCreateOrConnectWithoutLinkMapInput[]
    upsert?: RedirectRuleUpsertWithWhereUniqueWithoutLinkMapInput | RedirectRuleUpsertWithWhereUniqueWithoutLinkMapInput[]
    createMany?: RedirectRuleCreateManyLinkMapInputEnvelope
    set?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    disconnect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    delete?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    connect?: RedirectRuleWhereUniqueInput | RedirectRuleWhereUniqueInput[]
    update?: RedirectRuleUpdateWithWhereUniqueWithoutLinkMapInput | RedirectRuleUpdateWithWhereUniqueWithoutLinkMapInput[]
    updateMany?: RedirectRuleUpdateManyWithWhereWithoutLinkMapInput | RedirectRuleUpdateManyWithWhereWithoutLinkMapInput[]
    deleteMany?: RedirectRuleScalarWhereInput | RedirectRuleScalarWhereInput[]
  }

  export type LinkMapCreateNestedOneWithoutEntriesInput = {
    create?: XOR<LinkMapCreateWithoutEntriesInput, LinkMapUncheckedCreateWithoutEntriesInput>
    connectOrCreate?: LinkMapCreateOrConnectWithoutEntriesInput
    connect?: LinkMapWhereUniqueInput
  }

  export type LinkMapUpdateOneRequiredWithoutEntriesNestedInput = {
    create?: XOR<LinkMapCreateWithoutEntriesInput, LinkMapUncheckedCreateWithoutEntriesInput>
    connectOrCreate?: LinkMapCreateOrConnectWithoutEntriesInput
    upsert?: LinkMapUpsertWithoutEntriesInput
    connect?: LinkMapWhereUniqueInput
    update?: XOR<XOR<LinkMapUpdateToOneWithWhereWithoutEntriesInput, LinkMapUpdateWithoutEntriesInput>, LinkMapUncheckedUpdateWithoutEntriesInput>
  }

  export type RedirectRuleCreateNestedOneWithoutHitsHourlyInput = {
    create?: XOR<RedirectRuleCreateWithoutHitsHourlyInput, RedirectRuleUncheckedCreateWithoutHitsHourlyInput>
    connectOrCreate?: RedirectRuleCreateOrConnectWithoutHitsHourlyInput
    connect?: RedirectRuleWhereUniqueInput
  }

  export type OrganizationCreateNestedOneWithoutRedirectRuleHitsHourlyInput = {
    create?: XOR<OrganizationCreateWithoutRedirectRuleHitsHourlyInput, OrganizationUncheckedCreateWithoutRedirectRuleHitsHourlyInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutRedirectRuleHitsHourlyInput
    connect?: OrganizationWhereUniqueInput
  }

  export type RedirectRuleUpdateOneRequiredWithoutHitsHourlyNestedInput = {
    create?: XOR<RedirectRuleCreateWithoutHitsHourlyInput, RedirectRuleUncheckedCreateWithoutHitsHourlyInput>
    connectOrCreate?: RedirectRuleCreateOrConnectWithoutHitsHourlyInput
    upsert?: RedirectRuleUpsertWithoutHitsHourlyInput
    connect?: RedirectRuleWhereUniqueInput
    update?: XOR<XOR<RedirectRuleUpdateToOneWithWhereWithoutHitsHourlyInput, RedirectRuleUpdateWithoutHitsHourlyInput>, RedirectRuleUncheckedUpdateWithoutHitsHourlyInput>
  }

  export type OrganizationUpdateOneRequiredWithoutRedirectRuleHitsHourlyNestedInput = {
    create?: XOR<OrganizationCreateWithoutRedirectRuleHitsHourlyInput, OrganizationUncheckedCreateWithoutRedirectRuleHitsHourlyInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutRedirectRuleHitsHourlyInput
    upsert?: OrganizationUpsertWithoutRedirectRuleHitsHourlyInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutRedirectRuleHitsHourlyInput, OrganizationUpdateWithoutRedirectRuleHitsHourlyInput>, OrganizationUncheckedUpdateWithoutRedirectRuleHitsHourlyInput>
  }

  export type OrganizationCreateNestedOneWithoutRedirectTestsInput = {
    create?: XOR<OrganizationCreateWithoutRedirectTestsInput, OrganizationUncheckedCreateWithoutRedirectTestsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutRedirectTestsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type DomainGroupCreateNestedOneWithoutRedirectTestsInput = {
    create?: XOR<DomainGroupCreateWithoutRedirectTestsInput, DomainGroupUncheckedCreateWithoutRedirectTestsInput>
    connectOrCreate?: DomainGroupCreateOrConnectWithoutRedirectTestsInput
    connect?: DomainGroupWhereUniqueInput
  }

  export type OrganizationUpdateOneRequiredWithoutRedirectTestsNestedInput = {
    create?: XOR<OrganizationCreateWithoutRedirectTestsInput, OrganizationUncheckedCreateWithoutRedirectTestsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutRedirectTestsInput
    upsert?: OrganizationUpsertWithoutRedirectTestsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutRedirectTestsInput, OrganizationUpdateWithoutRedirectTestsInput>, OrganizationUncheckedUpdateWithoutRedirectTestsInput>
  }

  export type DomainGroupUpdateOneRequiredWithoutRedirectTestsNestedInput = {
    create?: XOR<DomainGroupCreateWithoutRedirectTestsInput, DomainGroupUncheckedCreateWithoutRedirectTestsInput>
    connectOrCreate?: DomainGroupCreateOrConnectWithoutRedirectTestsInput
    upsert?: DomainGroupUpsertWithoutRedirectTestsInput
    connect?: DomainGroupWhereUniqueInput
    update?: XOR<XOR<DomainGroupUpdateToOneWithWhereWithoutRedirectTestsInput, DomainGroupUpdateWithoutRedirectTestsInput>, DomainGroupUncheckedUpdateWithoutRedirectTestsInput>
  }

  export type OrganizationCreateNestedOneWithoutCheckoutSessionsInput = {
    create?: XOR<OrganizationCreateWithoutCheckoutSessionsInput, OrganizationUncheckedCreateWithoutCheckoutSessionsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutCheckoutSessionsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutCheckoutSessionsInput = {
    create?: XOR<UserCreateWithoutCheckoutSessionsInput, UserUncheckedCreateWithoutCheckoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCheckoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumBillingCheckoutStatusFieldUpdateOperationsInput = {
    set?: $Enums.BillingCheckoutStatus
  }

  export type OrganizationUpdateOneRequiredWithoutCheckoutSessionsNestedInput = {
    create?: XOR<OrganizationCreateWithoutCheckoutSessionsInput, OrganizationUncheckedCreateWithoutCheckoutSessionsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutCheckoutSessionsInput
    upsert?: OrganizationUpsertWithoutCheckoutSessionsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutCheckoutSessionsInput, OrganizationUpdateWithoutCheckoutSessionsInput>, OrganizationUncheckedUpdateWithoutCheckoutSessionsInput>
  }

  export type UserUpdateOneRequiredWithoutCheckoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutCheckoutSessionsInput, UserUncheckedCreateWithoutCheckoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCheckoutSessionsInput
    upsert?: UserUpsertWithoutCheckoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCheckoutSessionsInput, UserUpdateWithoutCheckoutSessionsInput>, UserUncheckedUpdateWithoutCheckoutSessionsInput>
  }

  export type OrganizationCreateNestedOneWithoutCustomPlansInput = {
    create?: XOR<OrganizationCreateWithoutCustomPlansInput, OrganizationUncheckedCreateWithoutCustomPlansInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutCustomPlansInput
    connect?: OrganizationWhereUniqueInput
  }

  export type OrganizationUpdateOneRequiredWithoutCustomPlansNestedInput = {
    create?: XOR<OrganizationCreateWithoutCustomPlansInput, OrganizationUncheckedCreateWithoutCustomPlansInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutCustomPlansInput
    upsert?: OrganizationUpsertWithoutCustomPlansInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutCustomPlansInput, OrganizationUpdateWithoutCustomPlansInput>, OrganizationUncheckedUpdateWithoutCustomPlansInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumRedirectQueryMatchFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectQueryMatch | EnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectQueryMatch[] | ListEnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectQueryMatch[] | ListEnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectQueryMatchFilter<$PrismaModel> | $Enums.RedirectQueryMatch
  }

  export type NestedEnumRedirectPathMatchFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectPathMatch | EnumRedirectPathMatchFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectPathMatch[] | ListEnumRedirectPathMatchFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectPathMatch[] | ListEnumRedirectPathMatchFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectPathMatchFilter<$PrismaModel> | $Enums.RedirectPathMatch
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumRedirectQueryMatchWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectQueryMatch | EnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectQueryMatch[] | ListEnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectQueryMatch[] | ListEnumRedirectQueryMatchFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectQueryMatchWithAggregatesFilter<$PrismaModel> | $Enums.RedirectQueryMatch
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRedirectQueryMatchFilter<$PrismaModel>
    _max?: NestedEnumRedirectQueryMatchFilter<$PrismaModel>
  }

  export type NestedEnumRedirectPathMatchWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectPathMatch | EnumRedirectPathMatchFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectPathMatch[] | ListEnumRedirectPathMatchFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectPathMatch[] | ListEnumRedirectPathMatchFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectPathMatchWithAggregatesFilter<$PrismaModel> | $Enums.RedirectPathMatch
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRedirectPathMatchFilter<$PrismaModel>
    _max?: NestedEnumRedirectPathMatchFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumBillingCheckoutStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCheckoutStatus | EnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCheckoutStatusFilter<$PrismaModel> | $Enums.BillingCheckoutStatus
  }

  export type NestedEnumBillingCheckoutStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCheckoutStatus | EnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCheckoutStatusWithAggregatesFilter<$PrismaModel> | $Enums.BillingCheckoutStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBillingCheckoutStatusFilter<$PrismaModel>
    _max?: NestedEnumBillingCheckoutStatusFilter<$PrismaModel>
  }

  export type UserCreateWithoutOrganizationInput = {
    id: string
    email: string
    passwordHash: string
    isOwner?: boolean
    emailVerifiedAt?: Date | string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    termsAcceptedAt?: Date | string | null
    privacyAcceptedAt?: Date | string | null
    ageConfirmedAt?: Date | string | null
    legalVersion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutUserInput
    createdInvites?: OrganizationInviteCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateWithoutOrganizationInput = {
    id: string
    email: string
    passwordHash: string
    isOwner?: boolean
    emailVerifiedAt?: Date | string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    termsAcceptedAt?: Date | string | null
    privacyAcceptedAt?: Date | string | null
    ageConfirmedAt?: Date | string | null
    legalVersion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutUserInput
    createdInvites?: OrganizationInviteUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserCreateOrConnectWithoutOrganizationInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput>
  }

  export type UserCreateManyOrganizationInputEnvelope = {
    data: UserCreateManyOrganizationInput | UserCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type DomainGroupCreateWithoutOrganizationInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domains?: DomainCreateNestedManyWithoutDomainGroupInput
    redirectRules?: RedirectRuleCreateNestedManyWithoutDomainGroupInput
    linkMaps?: LinkMapCreateNestedManyWithoutDomainGroupInput
    redirectTests?: RedirectTestCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupUncheckedCreateWithoutOrganizationInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domains?: DomainUncheckedCreateNestedManyWithoutDomainGroupInput
    redirectRules?: RedirectRuleUncheckedCreateNestedManyWithoutDomainGroupInput
    linkMaps?: LinkMapUncheckedCreateNestedManyWithoutDomainGroupInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupCreateOrConnectWithoutOrganizationInput = {
    where: DomainGroupWhereUniqueInput
    create: XOR<DomainGroupCreateWithoutOrganizationInput, DomainGroupUncheckedCreateWithoutOrganizationInput>
  }

  export type DomainGroupCreateManyOrganizationInputEnvelope = {
    data: DomainGroupCreateManyOrganizationInput | DomainGroupCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type BillingCheckoutSessionCreateWithoutOrganizationInput = {
    id: string
    plan: string
    status?: $Enums.BillingCheckoutStatus
    providerCheckoutId?: string | null
    providerOrderId?: string | null
    providerSubscriptionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    user: UserCreateNestedOneWithoutCheckoutSessionsInput
  }

  export type BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput = {
    id: string
    userId: string
    plan: string
    status?: $Enums.BillingCheckoutStatus
    providerCheckoutId?: string | null
    providerOrderId?: string | null
    providerSubscriptionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BillingCheckoutSessionCreateOrConnectWithoutOrganizationInput = {
    where: BillingCheckoutSessionWhereUniqueInput
    create: XOR<BillingCheckoutSessionCreateWithoutOrganizationInput, BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput>
  }

  export type BillingCheckoutSessionCreateManyOrganizationInputEnvelope = {
    data: BillingCheckoutSessionCreateManyOrganizationInput | BillingCheckoutSessionCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type CustomPlanCreateWithoutOrganizationInput = {
    id: string
    name: string
    description?: string | null
    monthlyVariantId?: string | null
    yearlyVariantId?: string | null
    limits: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type CustomPlanUncheckedCreateWithoutOrganizationInput = {
    id: string
    name: string
    description?: string | null
    monthlyVariantId?: string | null
    yearlyVariantId?: string | null
    limits: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type CustomPlanCreateOrConnectWithoutOrganizationInput = {
    where: CustomPlanWhereUniqueInput
    create: XOR<CustomPlanCreateWithoutOrganizationInput, CustomPlanUncheckedCreateWithoutOrganizationInput>
  }

  export type CustomPlanCreateManyOrganizationInputEnvelope = {
    data: CustomPlanCreateManyOrganizationInput | CustomPlanCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type RedirectTestCreateWithoutOrganizationInput = {
    id: string
    pathWithQuery: string
    requestData: JsonNullValueInput | InputJsonValue
    expectedResult: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domainGroup: DomainGroupCreateNestedOneWithoutRedirectTestsInput
  }

  export type RedirectTestUncheckedCreateWithoutOrganizationInput = {
    id: string
    domainGroupId: string
    pathWithQuery: string
    requestData: JsonNullValueInput | InputJsonValue
    expectedResult: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectTestCreateOrConnectWithoutOrganizationInput = {
    where: RedirectTestWhereUniqueInput
    create: XOR<RedirectTestCreateWithoutOrganizationInput, RedirectTestUncheckedCreateWithoutOrganizationInput>
  }

  export type RedirectTestCreateManyOrganizationInputEnvelope = {
    data: RedirectTestCreateManyOrganizationInput | RedirectTestCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationInviteCreateWithoutOrganizationInput = {
    id: string
    email: string
    tokenHash: string
    expiresAt: Date | string
    acceptedAt?: Date | string | null
    revokedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedInvitesInput
  }

  export type OrganizationInviteUncheckedCreateWithoutOrganizationInput = {
    id: string
    email: string
    tokenHash: string
    expiresAt: Date | string
    createdByUserId: string
    acceptedAt?: Date | string | null
    revokedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationInviteCreateOrConnectWithoutOrganizationInput = {
    where: OrganizationInviteWhereUniqueInput
    create: XOR<OrganizationInviteCreateWithoutOrganizationInput, OrganizationInviteUncheckedCreateWithoutOrganizationInput>
  }

  export type OrganizationInviteCreateManyOrganizationInputEnvelope = {
    data: OrganizationInviteCreateManyOrganizationInput | OrganizationInviteCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type RedirectRuleHitsHourlyCreateWithoutOrganizationInput = {
    bucketStart: Date | string
    hits: number
    createdAt?: Date | string
    updatedAt?: Date | string
    redirectRule: RedirectRuleCreateNestedOneWithoutHitsHourlyInput
  }

  export type RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput = {
    ruleId: string
    bucketStart: Date | string
    hits: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RedirectRuleHitsHourlyCreateOrConnectWithoutOrganizationInput = {
    where: RedirectRuleHitsHourlyWhereUniqueInput
    create: XOR<RedirectRuleHitsHourlyCreateWithoutOrganizationInput, RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput>
  }

  export type RedirectRuleHitsHourlyCreateManyOrganizationInputEnvelope = {
    data: RedirectRuleHitsHourlyCreateManyOrganizationInput | RedirectRuleHitsHourlyCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutOrganizationInput, UserUncheckedUpdateWithoutOrganizationInput>
    create: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput>
  }

  export type UserUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutOrganizationInput, UserUncheckedUpdateWithoutOrganizationInput>
  }

  export type UserUpdateManyWithWhereWithoutOrganizationInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    organizationId?: StringFilter<"User"> | string
    isOwner?: BoolFilter<"User"> | boolean
    emailVerifiedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isBlocked?: BoolFilter<"User"> | boolean
    blockedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    termsAcceptedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    privacyAcceptedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    ageConfirmedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    legalVersion?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
  }

  export type DomainGroupUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: DomainGroupWhereUniqueInput
    update: XOR<DomainGroupUpdateWithoutOrganizationInput, DomainGroupUncheckedUpdateWithoutOrganizationInput>
    create: XOR<DomainGroupCreateWithoutOrganizationInput, DomainGroupUncheckedCreateWithoutOrganizationInput>
  }

  export type DomainGroupUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: DomainGroupWhereUniqueInput
    data: XOR<DomainGroupUpdateWithoutOrganizationInput, DomainGroupUncheckedUpdateWithoutOrganizationInput>
  }

  export type DomainGroupUpdateManyWithWhereWithoutOrganizationInput = {
    where: DomainGroupScalarWhereInput
    data: XOR<DomainGroupUpdateManyMutationInput, DomainGroupUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type DomainGroupScalarWhereInput = {
    AND?: DomainGroupScalarWhereInput | DomainGroupScalarWhereInput[]
    OR?: DomainGroupScalarWhereInput[]
    NOT?: DomainGroupScalarWhereInput | DomainGroupScalarWhereInput[]
    id?: StringFilter<"DomainGroup"> | string
    name?: StringFilter<"DomainGroup"> | string
    organizationId?: StringFilter<"DomainGroup"> | string
    createdAt?: DateTimeFilter<"DomainGroup"> | Date | string
    updatedAt?: DateTimeFilter<"DomainGroup"> | Date | string
    deletedAt?: DateTimeNullableFilter<"DomainGroup"> | Date | string | null
  }

  export type BillingCheckoutSessionUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: BillingCheckoutSessionWhereUniqueInput
    update: XOR<BillingCheckoutSessionUpdateWithoutOrganizationInput, BillingCheckoutSessionUncheckedUpdateWithoutOrganizationInput>
    create: XOR<BillingCheckoutSessionCreateWithoutOrganizationInput, BillingCheckoutSessionUncheckedCreateWithoutOrganizationInput>
  }

  export type BillingCheckoutSessionUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: BillingCheckoutSessionWhereUniqueInput
    data: XOR<BillingCheckoutSessionUpdateWithoutOrganizationInput, BillingCheckoutSessionUncheckedUpdateWithoutOrganizationInput>
  }

  export type BillingCheckoutSessionUpdateManyWithWhereWithoutOrganizationInput = {
    where: BillingCheckoutSessionScalarWhereInput
    data: XOR<BillingCheckoutSessionUpdateManyMutationInput, BillingCheckoutSessionUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type BillingCheckoutSessionScalarWhereInput = {
    AND?: BillingCheckoutSessionScalarWhereInput | BillingCheckoutSessionScalarWhereInput[]
    OR?: BillingCheckoutSessionScalarWhereInput[]
    NOT?: BillingCheckoutSessionScalarWhereInput | BillingCheckoutSessionScalarWhereInput[]
    id?: StringFilter<"BillingCheckoutSession"> | string
    organizationId?: StringFilter<"BillingCheckoutSession"> | string
    userId?: StringFilter<"BillingCheckoutSession"> | string
    plan?: StringFilter<"BillingCheckoutSession"> | string
    status?: EnumBillingCheckoutStatusFilter<"BillingCheckoutSession"> | $Enums.BillingCheckoutStatus
    providerCheckoutId?: StringNullableFilter<"BillingCheckoutSession"> | string | null
    providerOrderId?: StringNullableFilter<"BillingCheckoutSession"> | string | null
    providerSubscriptionId?: StringNullableFilter<"BillingCheckoutSession"> | string | null
    createdAt?: DateTimeFilter<"BillingCheckoutSession"> | Date | string
    updatedAt?: DateTimeFilter<"BillingCheckoutSession"> | Date | string
    completedAt?: DateTimeNullableFilter<"BillingCheckoutSession"> | Date | string | null
    metadata?: JsonNullableFilter<"BillingCheckoutSession">
  }

  export type CustomPlanUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: CustomPlanWhereUniqueInput
    update: XOR<CustomPlanUpdateWithoutOrganizationInput, CustomPlanUncheckedUpdateWithoutOrganizationInput>
    create: XOR<CustomPlanCreateWithoutOrganizationInput, CustomPlanUncheckedCreateWithoutOrganizationInput>
  }

  export type CustomPlanUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: CustomPlanWhereUniqueInput
    data: XOR<CustomPlanUpdateWithoutOrganizationInput, CustomPlanUncheckedUpdateWithoutOrganizationInput>
  }

  export type CustomPlanUpdateManyWithWhereWithoutOrganizationInput = {
    where: CustomPlanScalarWhereInput
    data: XOR<CustomPlanUpdateManyMutationInput, CustomPlanUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type CustomPlanScalarWhereInput = {
    AND?: CustomPlanScalarWhereInput | CustomPlanScalarWhereInput[]
    OR?: CustomPlanScalarWhereInput[]
    NOT?: CustomPlanScalarWhereInput | CustomPlanScalarWhereInput[]
    id?: StringFilter<"CustomPlan"> | string
    organizationId?: StringFilter<"CustomPlan"> | string
    name?: StringFilter<"CustomPlan"> | string
    description?: StringNullableFilter<"CustomPlan"> | string | null
    monthlyVariantId?: StringNullableFilter<"CustomPlan"> | string | null
    yearlyVariantId?: StringNullableFilter<"CustomPlan"> | string | null
    limits?: JsonFilter<"CustomPlan">
    createdAt?: DateTimeFilter<"CustomPlan"> | Date | string
    updatedAt?: DateTimeFilter<"CustomPlan"> | Date | string
    deletedAt?: DateTimeNullableFilter<"CustomPlan"> | Date | string | null
  }

  export type RedirectTestUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: RedirectTestWhereUniqueInput
    update: XOR<RedirectTestUpdateWithoutOrganizationInput, RedirectTestUncheckedUpdateWithoutOrganizationInput>
    create: XOR<RedirectTestCreateWithoutOrganizationInput, RedirectTestUncheckedCreateWithoutOrganizationInput>
  }

  export type RedirectTestUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: RedirectTestWhereUniqueInput
    data: XOR<RedirectTestUpdateWithoutOrganizationInput, RedirectTestUncheckedUpdateWithoutOrganizationInput>
  }

  export type RedirectTestUpdateManyWithWhereWithoutOrganizationInput = {
    where: RedirectTestScalarWhereInput
    data: XOR<RedirectTestUpdateManyMutationInput, RedirectTestUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type RedirectTestScalarWhereInput = {
    AND?: RedirectTestScalarWhereInput | RedirectTestScalarWhereInput[]
    OR?: RedirectTestScalarWhereInput[]
    NOT?: RedirectTestScalarWhereInput | RedirectTestScalarWhereInput[]
    id?: StringFilter<"RedirectTest"> | string
    organizationId?: StringFilter<"RedirectTest"> | string
    domainGroupId?: StringFilter<"RedirectTest"> | string
    pathWithQuery?: StringFilter<"RedirectTest"> | string
    requestData?: JsonFilter<"RedirectTest">
    expectedResult?: JsonFilter<"RedirectTest">
    createdAt?: DateTimeFilter<"RedirectTest"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectTest"> | Date | string
    deletedAt?: DateTimeNullableFilter<"RedirectTest"> | Date | string | null
  }

  export type OrganizationInviteUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: OrganizationInviteWhereUniqueInput
    update: XOR<OrganizationInviteUpdateWithoutOrganizationInput, OrganizationInviteUncheckedUpdateWithoutOrganizationInput>
    create: XOR<OrganizationInviteCreateWithoutOrganizationInput, OrganizationInviteUncheckedCreateWithoutOrganizationInput>
  }

  export type OrganizationInviteUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: OrganizationInviteWhereUniqueInput
    data: XOR<OrganizationInviteUpdateWithoutOrganizationInput, OrganizationInviteUncheckedUpdateWithoutOrganizationInput>
  }

  export type OrganizationInviteUpdateManyWithWhereWithoutOrganizationInput = {
    where: OrganizationInviteScalarWhereInput
    data: XOR<OrganizationInviteUpdateManyMutationInput, OrganizationInviteUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type OrganizationInviteScalarWhereInput = {
    AND?: OrganizationInviteScalarWhereInput | OrganizationInviteScalarWhereInput[]
    OR?: OrganizationInviteScalarWhereInput[]
    NOT?: OrganizationInviteScalarWhereInput | OrganizationInviteScalarWhereInput[]
    id?: StringFilter<"OrganizationInvite"> | string
    organizationId?: StringFilter<"OrganizationInvite"> | string
    email?: StringFilter<"OrganizationInvite"> | string
    tokenHash?: StringFilter<"OrganizationInvite"> | string
    expiresAt?: DateTimeFilter<"OrganizationInvite"> | Date | string
    createdByUserId?: StringFilter<"OrganizationInvite"> | string
    acceptedAt?: DateTimeNullableFilter<"OrganizationInvite"> | Date | string | null
    revokedAt?: DateTimeNullableFilter<"OrganizationInvite"> | Date | string | null
    createdAt?: DateTimeFilter<"OrganizationInvite"> | Date | string
    updatedAt?: DateTimeFilter<"OrganizationInvite"> | Date | string
  }

  export type RedirectRuleHitsHourlyUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: RedirectRuleHitsHourlyWhereUniqueInput
    update: XOR<RedirectRuleHitsHourlyUpdateWithoutOrganizationInput, RedirectRuleHitsHourlyUncheckedUpdateWithoutOrganizationInput>
    create: XOR<RedirectRuleHitsHourlyCreateWithoutOrganizationInput, RedirectRuleHitsHourlyUncheckedCreateWithoutOrganizationInput>
  }

  export type RedirectRuleHitsHourlyUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: RedirectRuleHitsHourlyWhereUniqueInput
    data: XOR<RedirectRuleHitsHourlyUpdateWithoutOrganizationInput, RedirectRuleHitsHourlyUncheckedUpdateWithoutOrganizationInput>
  }

  export type RedirectRuleHitsHourlyUpdateManyWithWhereWithoutOrganizationInput = {
    where: RedirectRuleHitsHourlyScalarWhereInput
    data: XOR<RedirectRuleHitsHourlyUpdateManyMutationInput, RedirectRuleHitsHourlyUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type RedirectRuleHitsHourlyScalarWhereInput = {
    AND?: RedirectRuleHitsHourlyScalarWhereInput | RedirectRuleHitsHourlyScalarWhereInput[]
    OR?: RedirectRuleHitsHourlyScalarWhereInput[]
    NOT?: RedirectRuleHitsHourlyScalarWhereInput | RedirectRuleHitsHourlyScalarWhereInput[]
    ruleId?: StringFilter<"RedirectRuleHitsHourly"> | string
    organizationId?: StringFilter<"RedirectRuleHitsHourly"> | string
    bucketStart?: DateTimeFilter<"RedirectRuleHitsHourly"> | Date | string
    hits?: IntFilter<"RedirectRuleHitsHourly"> | number
    createdAt?: DateTimeFilter<"RedirectRuleHitsHourly"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectRuleHitsHourly"> | Date | string
  }

  export type OrganizationCreateWithoutUsersInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    domainGroups?: DomainGroupCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutUsersInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    domainGroups?: DomainGroupUncheckedCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanUncheckedCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteUncheckedCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutUsersInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutUsersInput, OrganizationUncheckedCreateWithoutUsersInput>
  }

  export type BillingCheckoutSessionCreateWithoutUserInput = {
    id: string
    plan: string
    status?: $Enums.BillingCheckoutStatus
    providerCheckoutId?: string | null
    providerOrderId?: string | null
    providerSubscriptionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    organization: OrganizationCreateNestedOneWithoutCheckoutSessionsInput
  }

  export type BillingCheckoutSessionUncheckedCreateWithoutUserInput = {
    id: string
    organizationId: string
    plan: string
    status?: $Enums.BillingCheckoutStatus
    providerCheckoutId?: string | null
    providerOrderId?: string | null
    providerSubscriptionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BillingCheckoutSessionCreateOrConnectWithoutUserInput = {
    where: BillingCheckoutSessionWhereUniqueInput
    create: XOR<BillingCheckoutSessionCreateWithoutUserInput, BillingCheckoutSessionUncheckedCreateWithoutUserInput>
  }

  export type BillingCheckoutSessionCreateManyUserInputEnvelope = {
    data: BillingCheckoutSessionCreateManyUserInput | BillingCheckoutSessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationInviteCreateWithoutCreatedByInput = {
    id: string
    email: string
    tokenHash: string
    expiresAt: Date | string
    acceptedAt?: Date | string | null
    revokedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutInvitesInput
  }

  export type OrganizationInviteUncheckedCreateWithoutCreatedByInput = {
    id: string
    organizationId: string
    email: string
    tokenHash: string
    expiresAt: Date | string
    acceptedAt?: Date | string | null
    revokedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationInviteCreateOrConnectWithoutCreatedByInput = {
    where: OrganizationInviteWhereUniqueInput
    create: XOR<OrganizationInviteCreateWithoutCreatedByInput, OrganizationInviteUncheckedCreateWithoutCreatedByInput>
  }

  export type OrganizationInviteCreateManyCreatedByInputEnvelope = {
    data: OrganizationInviteCreateManyCreatedByInput | OrganizationInviteCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationUpsertWithoutUsersInput = {
    update: XOR<OrganizationUpdateWithoutUsersInput, OrganizationUncheckedUpdateWithoutUsersInput>
    create: XOR<OrganizationCreateWithoutUsersInput, OrganizationUncheckedCreateWithoutUsersInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutUsersInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutUsersInput, OrganizationUncheckedUpdateWithoutUsersInput>
  }

  export type OrganizationUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    domainGroups?: DomainGroupUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    domainGroups?: DomainGroupUncheckedUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type BillingCheckoutSessionUpsertWithWhereUniqueWithoutUserInput = {
    where: BillingCheckoutSessionWhereUniqueInput
    update: XOR<BillingCheckoutSessionUpdateWithoutUserInput, BillingCheckoutSessionUncheckedUpdateWithoutUserInput>
    create: XOR<BillingCheckoutSessionCreateWithoutUserInput, BillingCheckoutSessionUncheckedCreateWithoutUserInput>
  }

  export type BillingCheckoutSessionUpdateWithWhereUniqueWithoutUserInput = {
    where: BillingCheckoutSessionWhereUniqueInput
    data: XOR<BillingCheckoutSessionUpdateWithoutUserInput, BillingCheckoutSessionUncheckedUpdateWithoutUserInput>
  }

  export type BillingCheckoutSessionUpdateManyWithWhereWithoutUserInput = {
    where: BillingCheckoutSessionScalarWhereInput
    data: XOR<BillingCheckoutSessionUpdateManyMutationInput, BillingCheckoutSessionUncheckedUpdateManyWithoutUserInput>
  }

  export type OrganizationInviteUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: OrganizationInviteWhereUniqueInput
    update: XOR<OrganizationInviteUpdateWithoutCreatedByInput, OrganizationInviteUncheckedUpdateWithoutCreatedByInput>
    create: XOR<OrganizationInviteCreateWithoutCreatedByInput, OrganizationInviteUncheckedCreateWithoutCreatedByInput>
  }

  export type OrganizationInviteUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: OrganizationInviteWhereUniqueInput
    data: XOR<OrganizationInviteUpdateWithoutCreatedByInput, OrganizationInviteUncheckedUpdateWithoutCreatedByInput>
  }

  export type OrganizationInviteUpdateManyWithWhereWithoutCreatedByInput = {
    where: OrganizationInviteScalarWhereInput
    data: XOR<OrganizationInviteUpdateManyMutationInput, OrganizationInviteUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type OrganizationCreateWithoutInvitesInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutInvitesInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupUncheckedCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanUncheckedCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutInvitesInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutInvitesInput, OrganizationUncheckedCreateWithoutInvitesInput>
  }

  export type UserCreateWithoutCreatedInvitesInput = {
    id: string
    email: string
    passwordHash: string
    isOwner?: boolean
    emailVerifiedAt?: Date | string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    termsAcceptedAt?: Date | string | null
    privacyAcceptedAt?: Date | string | null
    ageConfirmedAt?: Date | string | null
    legalVersion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutUsersInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCreatedInvitesInput = {
    id: string
    email: string
    passwordHash: string
    organizationId: string
    isOwner?: boolean
    emailVerifiedAt?: Date | string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    termsAcceptedAt?: Date | string | null
    privacyAcceptedAt?: Date | string | null
    ageConfirmedAt?: Date | string | null
    legalVersion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCreatedInvitesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedInvitesInput, UserUncheckedCreateWithoutCreatedInvitesInput>
  }

  export type OrganizationUpsertWithoutInvitesInput = {
    update: XOR<OrganizationUpdateWithoutInvitesInput, OrganizationUncheckedUpdateWithoutInvitesInput>
    create: XOR<OrganizationCreateWithoutInvitesInput, OrganizationUncheckedCreateWithoutInvitesInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutInvitesInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutInvitesInput, OrganizationUncheckedUpdateWithoutInvitesInput>
  }

  export type OrganizationUpdateWithoutInvitesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutInvitesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUncheckedUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type UserUpsertWithoutCreatedInvitesInput = {
    update: XOR<UserUpdateWithoutCreatedInvitesInput, UserUncheckedUpdateWithoutCreatedInvitesInput>
    create: XOR<UserCreateWithoutCreatedInvitesInput, UserUncheckedCreateWithoutCreatedInvitesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCreatedInvitesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCreatedInvitesInput, UserUncheckedUpdateWithoutCreatedInvitesInput>
  }

  export type UserUpdateWithoutCreatedInvitesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatedInvitesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type OrganizationCreateWithoutDomainGroupsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutDomainGroupsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanUncheckedCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteUncheckedCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutDomainGroupsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutDomainGroupsInput, OrganizationUncheckedCreateWithoutDomainGroupsInput>
  }

  export type DomainCreateWithoutDomainGroupInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type DomainUncheckedCreateWithoutDomainGroupInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type DomainCreateOrConnectWithoutDomainGroupInput = {
    where: DomainWhereUniqueInput
    create: XOR<DomainCreateWithoutDomainGroupInput, DomainUncheckedCreateWithoutDomainGroupInput>
  }

  export type DomainCreateManyDomainGroupInputEnvelope = {
    data: DomainCreateManyDomainGroupInput | DomainCreateManyDomainGroupInput[]
    skipDuplicates?: boolean
  }

  export type RedirectRuleCreateWithoutDomainGroupInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    linkMap?: LinkMapCreateNestedOneWithoutRedirectRulesInput
    hitsHourly?: RedirectRuleHitsHourlyCreateNestedManyWithoutRedirectRuleInput
  }

  export type RedirectRuleUncheckedCreateWithoutDomainGroupInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    linkMapId?: string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    hitsHourly?: RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutRedirectRuleInput
  }

  export type RedirectRuleCreateOrConnectWithoutDomainGroupInput = {
    where: RedirectRuleWhereUniqueInput
    create: XOR<RedirectRuleCreateWithoutDomainGroupInput, RedirectRuleUncheckedCreateWithoutDomainGroupInput>
  }

  export type RedirectRuleCreateManyDomainGroupInputEnvelope = {
    data: RedirectRuleCreateManyDomainGroupInput | RedirectRuleCreateManyDomainGroupInput[]
    skipDuplicates?: boolean
  }

  export type LinkMapCreateWithoutDomainGroupInput = {
    id: string
    name: string
    caseSensitive?: boolean
    queryMatch?: $Enums.RedirectQueryMatch
    fallbackDestination?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    entries?: LinkMapEntryCreateNestedManyWithoutLinkMapInput
    redirectRules?: RedirectRuleCreateNestedManyWithoutLinkMapInput
  }

  export type LinkMapUncheckedCreateWithoutDomainGroupInput = {
    id: string
    name: string
    caseSensitive?: boolean
    queryMatch?: $Enums.RedirectQueryMatch
    fallbackDestination?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    entries?: LinkMapEntryUncheckedCreateNestedManyWithoutLinkMapInput
    redirectRules?: RedirectRuleUncheckedCreateNestedManyWithoutLinkMapInput
  }

  export type LinkMapCreateOrConnectWithoutDomainGroupInput = {
    where: LinkMapWhereUniqueInput
    create: XOR<LinkMapCreateWithoutDomainGroupInput, LinkMapUncheckedCreateWithoutDomainGroupInput>
  }

  export type LinkMapCreateManyDomainGroupInputEnvelope = {
    data: LinkMapCreateManyDomainGroupInput | LinkMapCreateManyDomainGroupInput[]
    skipDuplicates?: boolean
  }

  export type RedirectTestCreateWithoutDomainGroupInput = {
    id: string
    pathWithQuery: string
    requestData: JsonNullValueInput | InputJsonValue
    expectedResult: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutRedirectTestsInput
  }

  export type RedirectTestUncheckedCreateWithoutDomainGroupInput = {
    id: string
    organizationId: string
    pathWithQuery: string
    requestData: JsonNullValueInput | InputJsonValue
    expectedResult: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectTestCreateOrConnectWithoutDomainGroupInput = {
    where: RedirectTestWhereUniqueInput
    create: XOR<RedirectTestCreateWithoutDomainGroupInput, RedirectTestUncheckedCreateWithoutDomainGroupInput>
  }

  export type RedirectTestCreateManyDomainGroupInputEnvelope = {
    data: RedirectTestCreateManyDomainGroupInput | RedirectTestCreateManyDomainGroupInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationUpsertWithoutDomainGroupsInput = {
    update: XOR<OrganizationUpdateWithoutDomainGroupsInput, OrganizationUncheckedUpdateWithoutDomainGroupsInput>
    create: XOR<OrganizationCreateWithoutDomainGroupsInput, OrganizationUncheckedCreateWithoutDomainGroupsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutDomainGroupsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutDomainGroupsInput, OrganizationUncheckedUpdateWithoutDomainGroupsInput>
  }

  export type OrganizationUpdateWithoutDomainGroupsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutDomainGroupsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type DomainUpsertWithWhereUniqueWithoutDomainGroupInput = {
    where: DomainWhereUniqueInput
    update: XOR<DomainUpdateWithoutDomainGroupInput, DomainUncheckedUpdateWithoutDomainGroupInput>
    create: XOR<DomainCreateWithoutDomainGroupInput, DomainUncheckedCreateWithoutDomainGroupInput>
  }

  export type DomainUpdateWithWhereUniqueWithoutDomainGroupInput = {
    where: DomainWhereUniqueInput
    data: XOR<DomainUpdateWithoutDomainGroupInput, DomainUncheckedUpdateWithoutDomainGroupInput>
  }

  export type DomainUpdateManyWithWhereWithoutDomainGroupInput = {
    where: DomainScalarWhereInput
    data: XOR<DomainUpdateManyMutationInput, DomainUncheckedUpdateManyWithoutDomainGroupInput>
  }

  export type DomainScalarWhereInput = {
    AND?: DomainScalarWhereInput | DomainScalarWhereInput[]
    OR?: DomainScalarWhereInput[]
    NOT?: DomainScalarWhereInput | DomainScalarWhereInput[]
    id?: StringFilter<"Domain"> | string
    name?: StringFilter<"Domain"> | string
    domainGroupId?: StringFilter<"Domain"> | string
    createdAt?: DateTimeFilter<"Domain"> | Date | string
    updatedAt?: DateTimeFilter<"Domain"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Domain"> | Date | string | null
  }

  export type RedirectRuleUpsertWithWhereUniqueWithoutDomainGroupInput = {
    where: RedirectRuleWhereUniqueInput
    update: XOR<RedirectRuleUpdateWithoutDomainGroupInput, RedirectRuleUncheckedUpdateWithoutDomainGroupInput>
    create: XOR<RedirectRuleCreateWithoutDomainGroupInput, RedirectRuleUncheckedCreateWithoutDomainGroupInput>
  }

  export type RedirectRuleUpdateWithWhereUniqueWithoutDomainGroupInput = {
    where: RedirectRuleWhereUniqueInput
    data: XOR<RedirectRuleUpdateWithoutDomainGroupInput, RedirectRuleUncheckedUpdateWithoutDomainGroupInput>
  }

  export type RedirectRuleUpdateManyWithWhereWithoutDomainGroupInput = {
    where: RedirectRuleScalarWhereInput
    data: XOR<RedirectRuleUpdateManyMutationInput, RedirectRuleUncheckedUpdateManyWithoutDomainGroupInput>
  }

  export type RedirectRuleScalarWhereInput = {
    AND?: RedirectRuleScalarWhereInput | RedirectRuleScalarWhereInput[]
    OR?: RedirectRuleScalarWhereInput[]
    NOT?: RedirectRuleScalarWhereInput | RedirectRuleScalarWhereInput[]
    id?: StringFilter<"RedirectRule"> | string
    source?: StringFilter<"RedirectRule"> | string
    destination?: StringFilter<"RedirectRule"> | string
    statusCode?: IntFilter<"RedirectRule"> | number
    matchMethod?: EnumHttpMethodNullableListFilter<"RedirectRule">
    queryMatch?: EnumRedirectQueryMatchFilter<"RedirectRule"> | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFilter<"RedirectRule"> | $Enums.RedirectPathMatch
    linkMapId?: StringNullableFilter<"RedirectRule"> | string | null
    isBlocked?: BoolFilter<"RedirectRule"> | boolean
    blockedAt?: DateTimeNullableFilter<"RedirectRule"> | Date | string | null
    priority?: IntFilter<"RedirectRule"> | number
    domainGroupId?: StringFilter<"RedirectRule"> | string
    createdAt?: DateTimeFilter<"RedirectRule"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectRule"> | Date | string
    deletedAt?: DateTimeNullableFilter<"RedirectRule"> | Date | string | null
  }

  export type LinkMapUpsertWithWhereUniqueWithoutDomainGroupInput = {
    where: LinkMapWhereUniqueInput
    update: XOR<LinkMapUpdateWithoutDomainGroupInput, LinkMapUncheckedUpdateWithoutDomainGroupInput>
    create: XOR<LinkMapCreateWithoutDomainGroupInput, LinkMapUncheckedCreateWithoutDomainGroupInput>
  }

  export type LinkMapUpdateWithWhereUniqueWithoutDomainGroupInput = {
    where: LinkMapWhereUniqueInput
    data: XOR<LinkMapUpdateWithoutDomainGroupInput, LinkMapUncheckedUpdateWithoutDomainGroupInput>
  }

  export type LinkMapUpdateManyWithWhereWithoutDomainGroupInput = {
    where: LinkMapScalarWhereInput
    data: XOR<LinkMapUpdateManyMutationInput, LinkMapUncheckedUpdateManyWithoutDomainGroupInput>
  }

  export type LinkMapScalarWhereInput = {
    AND?: LinkMapScalarWhereInput | LinkMapScalarWhereInput[]
    OR?: LinkMapScalarWhereInput[]
    NOT?: LinkMapScalarWhereInput | LinkMapScalarWhereInput[]
    id?: StringFilter<"LinkMap"> | string
    name?: StringFilter<"LinkMap"> | string
    domainGroupId?: StringFilter<"LinkMap"> | string
    caseSensitive?: BoolFilter<"LinkMap"> | boolean
    queryMatch?: EnumRedirectQueryMatchFilter<"LinkMap"> | $Enums.RedirectQueryMatch
    fallbackDestination?: StringNullableFilter<"LinkMap"> | string | null
    createdAt?: DateTimeFilter<"LinkMap"> | Date | string
    updatedAt?: DateTimeFilter<"LinkMap"> | Date | string
    deletedAt?: DateTimeNullableFilter<"LinkMap"> | Date | string | null
  }

  export type RedirectTestUpsertWithWhereUniqueWithoutDomainGroupInput = {
    where: RedirectTestWhereUniqueInput
    update: XOR<RedirectTestUpdateWithoutDomainGroupInput, RedirectTestUncheckedUpdateWithoutDomainGroupInput>
    create: XOR<RedirectTestCreateWithoutDomainGroupInput, RedirectTestUncheckedCreateWithoutDomainGroupInput>
  }

  export type RedirectTestUpdateWithWhereUniqueWithoutDomainGroupInput = {
    where: RedirectTestWhereUniqueInput
    data: XOR<RedirectTestUpdateWithoutDomainGroupInput, RedirectTestUncheckedUpdateWithoutDomainGroupInput>
  }

  export type RedirectTestUpdateManyWithWhereWithoutDomainGroupInput = {
    where: RedirectTestScalarWhereInput
    data: XOR<RedirectTestUpdateManyMutationInput, RedirectTestUncheckedUpdateManyWithoutDomainGroupInput>
  }

  export type DomainGroupCreateWithoutDomainsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutDomainGroupsInput
    redirectRules?: RedirectRuleCreateNestedManyWithoutDomainGroupInput
    linkMaps?: LinkMapCreateNestedManyWithoutDomainGroupInput
    redirectTests?: RedirectTestCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupUncheckedCreateWithoutDomainsInput = {
    id: string
    name: string
    organizationId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    redirectRules?: RedirectRuleUncheckedCreateNestedManyWithoutDomainGroupInput
    linkMaps?: LinkMapUncheckedCreateNestedManyWithoutDomainGroupInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupCreateOrConnectWithoutDomainsInput = {
    where: DomainGroupWhereUniqueInput
    create: XOR<DomainGroupCreateWithoutDomainsInput, DomainGroupUncheckedCreateWithoutDomainsInput>
  }

  export type DomainGroupUpsertWithoutDomainsInput = {
    update: XOR<DomainGroupUpdateWithoutDomainsInput, DomainGroupUncheckedUpdateWithoutDomainsInput>
    create: XOR<DomainGroupCreateWithoutDomainsInput, DomainGroupUncheckedCreateWithoutDomainsInput>
    where?: DomainGroupWhereInput
  }

  export type DomainGroupUpdateToOneWithWhereWithoutDomainsInput = {
    where?: DomainGroupWhereInput
    data: XOR<DomainGroupUpdateWithoutDomainsInput, DomainGroupUncheckedUpdateWithoutDomainsInput>
  }

  export type DomainGroupUpdateWithoutDomainsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutDomainGroupsNestedInput
    redirectRules?: RedirectRuleUpdateManyWithoutDomainGroupNestedInput
    linkMaps?: LinkMapUpdateManyWithoutDomainGroupNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutDomainGroupNestedInput
  }

  export type DomainGroupUncheckedUpdateWithoutDomainsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    redirectRules?: RedirectRuleUncheckedUpdateManyWithoutDomainGroupNestedInput
    linkMaps?: LinkMapUncheckedUpdateManyWithoutDomainGroupNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutDomainGroupNestedInput
  }

  export type DomainGroupCreateWithoutRedirectRulesInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutDomainGroupsInput
    domains?: DomainCreateNestedManyWithoutDomainGroupInput
    linkMaps?: LinkMapCreateNestedManyWithoutDomainGroupInput
    redirectTests?: RedirectTestCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupUncheckedCreateWithoutRedirectRulesInput = {
    id: string
    name: string
    organizationId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domains?: DomainUncheckedCreateNestedManyWithoutDomainGroupInput
    linkMaps?: LinkMapUncheckedCreateNestedManyWithoutDomainGroupInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupCreateOrConnectWithoutRedirectRulesInput = {
    where: DomainGroupWhereUniqueInput
    create: XOR<DomainGroupCreateWithoutRedirectRulesInput, DomainGroupUncheckedCreateWithoutRedirectRulesInput>
  }

  export type LinkMapCreateWithoutRedirectRulesInput = {
    id: string
    name: string
    caseSensitive?: boolean
    queryMatch?: $Enums.RedirectQueryMatch
    fallbackDestination?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domainGroup: DomainGroupCreateNestedOneWithoutLinkMapsInput
    entries?: LinkMapEntryCreateNestedManyWithoutLinkMapInput
  }

  export type LinkMapUncheckedCreateWithoutRedirectRulesInput = {
    id: string
    name: string
    domainGroupId: string
    caseSensitive?: boolean
    queryMatch?: $Enums.RedirectQueryMatch
    fallbackDestination?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    entries?: LinkMapEntryUncheckedCreateNestedManyWithoutLinkMapInput
  }

  export type LinkMapCreateOrConnectWithoutRedirectRulesInput = {
    where: LinkMapWhereUniqueInput
    create: XOR<LinkMapCreateWithoutRedirectRulesInput, LinkMapUncheckedCreateWithoutRedirectRulesInput>
  }

  export type RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput = {
    bucketStart: Date | string
    hits: number
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutRedirectRuleHitsHourlyInput
  }

  export type RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput = {
    organizationId: string
    bucketStart: Date | string
    hits: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RedirectRuleHitsHourlyCreateOrConnectWithoutRedirectRuleInput = {
    where: RedirectRuleHitsHourlyWhereUniqueInput
    create: XOR<RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput, RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput>
  }

  export type RedirectRuleHitsHourlyCreateManyRedirectRuleInputEnvelope = {
    data: RedirectRuleHitsHourlyCreateManyRedirectRuleInput | RedirectRuleHitsHourlyCreateManyRedirectRuleInput[]
    skipDuplicates?: boolean
  }

  export type DomainGroupUpsertWithoutRedirectRulesInput = {
    update: XOR<DomainGroupUpdateWithoutRedirectRulesInput, DomainGroupUncheckedUpdateWithoutRedirectRulesInput>
    create: XOR<DomainGroupCreateWithoutRedirectRulesInput, DomainGroupUncheckedCreateWithoutRedirectRulesInput>
    where?: DomainGroupWhereInput
  }

  export type DomainGroupUpdateToOneWithWhereWithoutRedirectRulesInput = {
    where?: DomainGroupWhereInput
    data: XOR<DomainGroupUpdateWithoutRedirectRulesInput, DomainGroupUncheckedUpdateWithoutRedirectRulesInput>
  }

  export type DomainGroupUpdateWithoutRedirectRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutDomainGroupsNestedInput
    domains?: DomainUpdateManyWithoutDomainGroupNestedInput
    linkMaps?: LinkMapUpdateManyWithoutDomainGroupNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutDomainGroupNestedInput
  }

  export type DomainGroupUncheckedUpdateWithoutRedirectRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domains?: DomainUncheckedUpdateManyWithoutDomainGroupNestedInput
    linkMaps?: LinkMapUncheckedUpdateManyWithoutDomainGroupNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutDomainGroupNestedInput
  }

  export type LinkMapUpsertWithoutRedirectRulesInput = {
    update: XOR<LinkMapUpdateWithoutRedirectRulesInput, LinkMapUncheckedUpdateWithoutRedirectRulesInput>
    create: XOR<LinkMapCreateWithoutRedirectRulesInput, LinkMapUncheckedCreateWithoutRedirectRulesInput>
    where?: LinkMapWhereInput
  }

  export type LinkMapUpdateToOneWithWhereWithoutRedirectRulesInput = {
    where?: LinkMapWhereInput
    data: XOR<LinkMapUpdateWithoutRedirectRulesInput, LinkMapUncheckedUpdateWithoutRedirectRulesInput>
  }

  export type LinkMapUpdateWithoutRedirectRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domainGroup?: DomainGroupUpdateOneRequiredWithoutLinkMapsNestedInput
    entries?: LinkMapEntryUpdateManyWithoutLinkMapNestedInput
  }

  export type LinkMapUncheckedUpdateWithoutRedirectRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    domainGroupId?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    entries?: LinkMapEntryUncheckedUpdateManyWithoutLinkMapNestedInput
  }

  export type RedirectRuleHitsHourlyUpsertWithWhereUniqueWithoutRedirectRuleInput = {
    where: RedirectRuleHitsHourlyWhereUniqueInput
    update: XOR<RedirectRuleHitsHourlyUpdateWithoutRedirectRuleInput, RedirectRuleHitsHourlyUncheckedUpdateWithoutRedirectRuleInput>
    create: XOR<RedirectRuleHitsHourlyCreateWithoutRedirectRuleInput, RedirectRuleHitsHourlyUncheckedCreateWithoutRedirectRuleInput>
  }

  export type RedirectRuleHitsHourlyUpdateWithWhereUniqueWithoutRedirectRuleInput = {
    where: RedirectRuleHitsHourlyWhereUniqueInput
    data: XOR<RedirectRuleHitsHourlyUpdateWithoutRedirectRuleInput, RedirectRuleHitsHourlyUncheckedUpdateWithoutRedirectRuleInput>
  }

  export type RedirectRuleHitsHourlyUpdateManyWithWhereWithoutRedirectRuleInput = {
    where: RedirectRuleHitsHourlyScalarWhereInput
    data: XOR<RedirectRuleHitsHourlyUpdateManyMutationInput, RedirectRuleHitsHourlyUncheckedUpdateManyWithoutRedirectRuleInput>
  }

  export type DomainGroupCreateWithoutLinkMapsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutDomainGroupsInput
    domains?: DomainCreateNestedManyWithoutDomainGroupInput
    redirectRules?: RedirectRuleCreateNestedManyWithoutDomainGroupInput
    redirectTests?: RedirectTestCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupUncheckedCreateWithoutLinkMapsInput = {
    id: string
    name: string
    organizationId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domains?: DomainUncheckedCreateNestedManyWithoutDomainGroupInput
    redirectRules?: RedirectRuleUncheckedCreateNestedManyWithoutDomainGroupInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupCreateOrConnectWithoutLinkMapsInput = {
    where: DomainGroupWhereUniqueInput
    create: XOR<DomainGroupCreateWithoutLinkMapsInput, DomainGroupUncheckedCreateWithoutLinkMapsInput>
  }

  export type LinkMapEntryCreateWithoutLinkMapInput = {
    id: string
    key: string
    keyNormalized: string
    destination: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type LinkMapEntryUncheckedCreateWithoutLinkMapInput = {
    id: string
    key: string
    keyNormalized: string
    destination: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type LinkMapEntryCreateOrConnectWithoutLinkMapInput = {
    where: LinkMapEntryWhereUniqueInput
    create: XOR<LinkMapEntryCreateWithoutLinkMapInput, LinkMapEntryUncheckedCreateWithoutLinkMapInput>
  }

  export type LinkMapEntryCreateManyLinkMapInputEnvelope = {
    data: LinkMapEntryCreateManyLinkMapInput | LinkMapEntryCreateManyLinkMapInput[]
    skipDuplicates?: boolean
  }

  export type RedirectRuleCreateWithoutLinkMapInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domainGroup: DomainGroupCreateNestedOneWithoutRedirectRulesInput
    hitsHourly?: RedirectRuleHitsHourlyCreateNestedManyWithoutRedirectRuleInput
  }

  export type RedirectRuleUncheckedCreateWithoutLinkMapInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    domainGroupId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    hitsHourly?: RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutRedirectRuleInput
  }

  export type RedirectRuleCreateOrConnectWithoutLinkMapInput = {
    where: RedirectRuleWhereUniqueInput
    create: XOR<RedirectRuleCreateWithoutLinkMapInput, RedirectRuleUncheckedCreateWithoutLinkMapInput>
  }

  export type RedirectRuleCreateManyLinkMapInputEnvelope = {
    data: RedirectRuleCreateManyLinkMapInput | RedirectRuleCreateManyLinkMapInput[]
    skipDuplicates?: boolean
  }

  export type DomainGroupUpsertWithoutLinkMapsInput = {
    update: XOR<DomainGroupUpdateWithoutLinkMapsInput, DomainGroupUncheckedUpdateWithoutLinkMapsInput>
    create: XOR<DomainGroupCreateWithoutLinkMapsInput, DomainGroupUncheckedCreateWithoutLinkMapsInput>
    where?: DomainGroupWhereInput
  }

  export type DomainGroupUpdateToOneWithWhereWithoutLinkMapsInput = {
    where?: DomainGroupWhereInput
    data: XOR<DomainGroupUpdateWithoutLinkMapsInput, DomainGroupUncheckedUpdateWithoutLinkMapsInput>
  }

  export type DomainGroupUpdateWithoutLinkMapsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutDomainGroupsNestedInput
    domains?: DomainUpdateManyWithoutDomainGroupNestedInput
    redirectRules?: RedirectRuleUpdateManyWithoutDomainGroupNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutDomainGroupNestedInput
  }

  export type DomainGroupUncheckedUpdateWithoutLinkMapsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domains?: DomainUncheckedUpdateManyWithoutDomainGroupNestedInput
    redirectRules?: RedirectRuleUncheckedUpdateManyWithoutDomainGroupNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutDomainGroupNestedInput
  }

  export type LinkMapEntryUpsertWithWhereUniqueWithoutLinkMapInput = {
    where: LinkMapEntryWhereUniqueInput
    update: XOR<LinkMapEntryUpdateWithoutLinkMapInput, LinkMapEntryUncheckedUpdateWithoutLinkMapInput>
    create: XOR<LinkMapEntryCreateWithoutLinkMapInput, LinkMapEntryUncheckedCreateWithoutLinkMapInput>
  }

  export type LinkMapEntryUpdateWithWhereUniqueWithoutLinkMapInput = {
    where: LinkMapEntryWhereUniqueInput
    data: XOR<LinkMapEntryUpdateWithoutLinkMapInput, LinkMapEntryUncheckedUpdateWithoutLinkMapInput>
  }

  export type LinkMapEntryUpdateManyWithWhereWithoutLinkMapInput = {
    where: LinkMapEntryScalarWhereInput
    data: XOR<LinkMapEntryUpdateManyMutationInput, LinkMapEntryUncheckedUpdateManyWithoutLinkMapInput>
  }

  export type LinkMapEntryScalarWhereInput = {
    AND?: LinkMapEntryScalarWhereInput | LinkMapEntryScalarWhereInput[]
    OR?: LinkMapEntryScalarWhereInput[]
    NOT?: LinkMapEntryScalarWhereInput | LinkMapEntryScalarWhereInput[]
    id?: StringFilter<"LinkMapEntry"> | string
    linkMapId?: StringFilter<"LinkMapEntry"> | string
    key?: StringFilter<"LinkMapEntry"> | string
    keyNormalized?: StringFilter<"LinkMapEntry"> | string
    destination?: StringFilter<"LinkMapEntry"> | string
    createdAt?: DateTimeFilter<"LinkMapEntry"> | Date | string
    updatedAt?: DateTimeFilter<"LinkMapEntry"> | Date | string
    deletedAt?: DateTimeNullableFilter<"LinkMapEntry"> | Date | string | null
  }

  export type RedirectRuleUpsertWithWhereUniqueWithoutLinkMapInput = {
    where: RedirectRuleWhereUniqueInput
    update: XOR<RedirectRuleUpdateWithoutLinkMapInput, RedirectRuleUncheckedUpdateWithoutLinkMapInput>
    create: XOR<RedirectRuleCreateWithoutLinkMapInput, RedirectRuleUncheckedCreateWithoutLinkMapInput>
  }

  export type RedirectRuleUpdateWithWhereUniqueWithoutLinkMapInput = {
    where: RedirectRuleWhereUniqueInput
    data: XOR<RedirectRuleUpdateWithoutLinkMapInput, RedirectRuleUncheckedUpdateWithoutLinkMapInput>
  }

  export type RedirectRuleUpdateManyWithWhereWithoutLinkMapInput = {
    where: RedirectRuleScalarWhereInput
    data: XOR<RedirectRuleUpdateManyMutationInput, RedirectRuleUncheckedUpdateManyWithoutLinkMapInput>
  }

  export type LinkMapCreateWithoutEntriesInput = {
    id: string
    name: string
    caseSensitive?: boolean
    queryMatch?: $Enums.RedirectQueryMatch
    fallbackDestination?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domainGroup: DomainGroupCreateNestedOneWithoutLinkMapsInput
    redirectRules?: RedirectRuleCreateNestedManyWithoutLinkMapInput
  }

  export type LinkMapUncheckedCreateWithoutEntriesInput = {
    id: string
    name: string
    domainGroupId: string
    caseSensitive?: boolean
    queryMatch?: $Enums.RedirectQueryMatch
    fallbackDestination?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    redirectRules?: RedirectRuleUncheckedCreateNestedManyWithoutLinkMapInput
  }

  export type LinkMapCreateOrConnectWithoutEntriesInput = {
    where: LinkMapWhereUniqueInput
    create: XOR<LinkMapCreateWithoutEntriesInput, LinkMapUncheckedCreateWithoutEntriesInput>
  }

  export type LinkMapUpsertWithoutEntriesInput = {
    update: XOR<LinkMapUpdateWithoutEntriesInput, LinkMapUncheckedUpdateWithoutEntriesInput>
    create: XOR<LinkMapCreateWithoutEntriesInput, LinkMapUncheckedCreateWithoutEntriesInput>
    where?: LinkMapWhereInput
  }

  export type LinkMapUpdateToOneWithWhereWithoutEntriesInput = {
    where?: LinkMapWhereInput
    data: XOR<LinkMapUpdateWithoutEntriesInput, LinkMapUncheckedUpdateWithoutEntriesInput>
  }

  export type LinkMapUpdateWithoutEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domainGroup?: DomainGroupUpdateOneRequiredWithoutLinkMapsNestedInput
    redirectRules?: RedirectRuleUpdateManyWithoutLinkMapNestedInput
  }

  export type LinkMapUncheckedUpdateWithoutEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    domainGroupId?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    redirectRules?: RedirectRuleUncheckedUpdateManyWithoutLinkMapNestedInput
  }

  export type RedirectRuleCreateWithoutHitsHourlyInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domainGroup: DomainGroupCreateNestedOneWithoutRedirectRulesInput
    linkMap?: LinkMapCreateNestedOneWithoutRedirectRulesInput
  }

  export type RedirectRuleUncheckedCreateWithoutHitsHourlyInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    linkMapId?: string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    domainGroupId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectRuleCreateOrConnectWithoutHitsHourlyInput = {
    where: RedirectRuleWhereUniqueInput
    create: XOR<RedirectRuleCreateWithoutHitsHourlyInput, RedirectRuleUncheckedCreateWithoutHitsHourlyInput>
  }

  export type OrganizationCreateWithoutRedirectRuleHitsHourlyInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutRedirectRuleHitsHourlyInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupUncheckedCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanUncheckedCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutRedirectRuleHitsHourlyInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutRedirectRuleHitsHourlyInput, OrganizationUncheckedCreateWithoutRedirectRuleHitsHourlyInput>
  }

  export type RedirectRuleUpsertWithoutHitsHourlyInput = {
    update: XOR<RedirectRuleUpdateWithoutHitsHourlyInput, RedirectRuleUncheckedUpdateWithoutHitsHourlyInput>
    create: XOR<RedirectRuleCreateWithoutHitsHourlyInput, RedirectRuleUncheckedCreateWithoutHitsHourlyInput>
    where?: RedirectRuleWhereInput
  }

  export type RedirectRuleUpdateToOneWithWhereWithoutHitsHourlyInput = {
    where?: RedirectRuleWhereInput
    data: XOR<RedirectRuleUpdateWithoutHitsHourlyInput, RedirectRuleUncheckedUpdateWithoutHitsHourlyInput>
  }

  export type RedirectRuleUpdateWithoutHitsHourlyInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domainGroup?: DomainGroupUpdateOneRequiredWithoutRedirectRulesNestedInput
    linkMap?: LinkMapUpdateOneWithoutRedirectRulesNestedInput
  }

  export type RedirectRuleUncheckedUpdateWithoutHitsHourlyInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    linkMapId?: NullableStringFieldUpdateOperationsInput | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    domainGroupId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrganizationUpsertWithoutRedirectRuleHitsHourlyInput = {
    update: XOR<OrganizationUpdateWithoutRedirectRuleHitsHourlyInput, OrganizationUncheckedUpdateWithoutRedirectRuleHitsHourlyInput>
    create: XOR<OrganizationCreateWithoutRedirectRuleHitsHourlyInput, OrganizationUncheckedCreateWithoutRedirectRuleHitsHourlyInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutRedirectRuleHitsHourlyInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutRedirectRuleHitsHourlyInput, OrganizationUncheckedUpdateWithoutRedirectRuleHitsHourlyInput>
  }

  export type OrganizationUpdateWithoutRedirectRuleHitsHourlyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutRedirectRuleHitsHourlyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUncheckedUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationCreateWithoutRedirectTestsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutRedirectTestsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupUncheckedCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanUncheckedCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteUncheckedCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutRedirectTestsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutRedirectTestsInput, OrganizationUncheckedCreateWithoutRedirectTestsInput>
  }

  export type DomainGroupCreateWithoutRedirectTestsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutDomainGroupsInput
    domains?: DomainCreateNestedManyWithoutDomainGroupInput
    redirectRules?: RedirectRuleCreateNestedManyWithoutDomainGroupInput
    linkMaps?: LinkMapCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupUncheckedCreateWithoutRedirectTestsInput = {
    id: string
    name: string
    organizationId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domains?: DomainUncheckedCreateNestedManyWithoutDomainGroupInput
    redirectRules?: RedirectRuleUncheckedCreateNestedManyWithoutDomainGroupInput
    linkMaps?: LinkMapUncheckedCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupCreateOrConnectWithoutRedirectTestsInput = {
    where: DomainGroupWhereUniqueInput
    create: XOR<DomainGroupCreateWithoutRedirectTestsInput, DomainGroupUncheckedCreateWithoutRedirectTestsInput>
  }

  export type OrganizationUpsertWithoutRedirectTestsInput = {
    update: XOR<OrganizationUpdateWithoutRedirectTestsInput, OrganizationUncheckedUpdateWithoutRedirectTestsInput>
    create: XOR<OrganizationCreateWithoutRedirectTestsInput, OrganizationUncheckedCreateWithoutRedirectTestsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutRedirectTestsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutRedirectTestsInput, OrganizationUncheckedUpdateWithoutRedirectTestsInput>
  }

  export type OrganizationUpdateWithoutRedirectTestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutRedirectTestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUncheckedUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUncheckedUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type DomainGroupUpsertWithoutRedirectTestsInput = {
    update: XOR<DomainGroupUpdateWithoutRedirectTestsInput, DomainGroupUncheckedUpdateWithoutRedirectTestsInput>
    create: XOR<DomainGroupCreateWithoutRedirectTestsInput, DomainGroupUncheckedCreateWithoutRedirectTestsInput>
    where?: DomainGroupWhereInput
  }

  export type DomainGroupUpdateToOneWithWhereWithoutRedirectTestsInput = {
    where?: DomainGroupWhereInput
    data: XOR<DomainGroupUpdateWithoutRedirectTestsInput, DomainGroupUncheckedUpdateWithoutRedirectTestsInput>
  }

  export type DomainGroupUpdateWithoutRedirectTestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutDomainGroupsNestedInput
    domains?: DomainUpdateManyWithoutDomainGroupNestedInput
    redirectRules?: RedirectRuleUpdateManyWithoutDomainGroupNestedInput
    linkMaps?: LinkMapUpdateManyWithoutDomainGroupNestedInput
  }

  export type DomainGroupUncheckedUpdateWithoutRedirectTestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domains?: DomainUncheckedUpdateManyWithoutDomainGroupNestedInput
    redirectRules?: RedirectRuleUncheckedUpdateManyWithoutDomainGroupNestedInput
    linkMaps?: LinkMapUncheckedUpdateManyWithoutDomainGroupNestedInput
  }

  export type OrganizationCreateWithoutCheckoutSessionsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutCheckoutSessionsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupUncheckedCreateNestedManyWithoutOrganizationInput
    customPlans?: CustomPlanUncheckedCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteUncheckedCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutCheckoutSessionsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutCheckoutSessionsInput, OrganizationUncheckedCreateWithoutCheckoutSessionsInput>
  }

  export type UserCreateWithoutCheckoutSessionsInput = {
    id: string
    email: string
    passwordHash: string
    isOwner?: boolean
    emailVerifiedAt?: Date | string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    termsAcceptedAt?: Date | string | null
    privacyAcceptedAt?: Date | string | null
    ageConfirmedAt?: Date | string | null
    legalVersion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutUsersInput
    createdInvites?: OrganizationInviteCreateNestedManyWithoutCreatedByInput
  }

  export type UserUncheckedCreateWithoutCheckoutSessionsInput = {
    id: string
    email: string
    passwordHash: string
    organizationId: string
    isOwner?: boolean
    emailVerifiedAt?: Date | string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    termsAcceptedAt?: Date | string | null
    privacyAcceptedAt?: Date | string | null
    ageConfirmedAt?: Date | string | null
    legalVersion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    createdInvites?: OrganizationInviteUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserCreateOrConnectWithoutCheckoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCheckoutSessionsInput, UserUncheckedCreateWithoutCheckoutSessionsInput>
  }

  export type OrganizationUpsertWithoutCheckoutSessionsInput = {
    update: XOR<OrganizationUpdateWithoutCheckoutSessionsInput, OrganizationUncheckedUpdateWithoutCheckoutSessionsInput>
    create: XOR<OrganizationCreateWithoutCheckoutSessionsInput, OrganizationUncheckedCreateWithoutCheckoutSessionsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutCheckoutSessionsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutCheckoutSessionsInput, OrganizationUncheckedUpdateWithoutCheckoutSessionsInput>
  }

  export type OrganizationUpdateWithoutCheckoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutCheckoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUncheckedUpdateManyWithoutOrganizationNestedInput
    customPlans?: CustomPlanUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type UserUpsertWithoutCheckoutSessionsInput = {
    update: XOR<UserUpdateWithoutCheckoutSessionsInput, UserUncheckedUpdateWithoutCheckoutSessionsInput>
    create: XOR<UserCreateWithoutCheckoutSessionsInput, UserUncheckedCreateWithoutCheckoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCheckoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCheckoutSessionsInput, UserUncheckedUpdateWithoutCheckoutSessionsInput>
  }

  export type UserUpdateWithoutCheckoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    createdInvites?: OrganizationInviteUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateWithoutCheckoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdInvites?: OrganizationInviteUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type OrganizationCreateWithoutCustomPlansInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutCustomPlansInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedCreateNestedManyWithoutOrganizationInput
    domainGroups?: DomainGroupUncheckedCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutOrganizationInput
    redirectTests?: RedirectTestUncheckedCreateNestedManyWithoutOrganizationInput
    invites?: OrganizationInviteUncheckedCreateNestedManyWithoutOrganizationInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutCustomPlansInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutCustomPlansInput, OrganizationUncheckedCreateWithoutCustomPlansInput>
  }

  export type OrganizationUpsertWithoutCustomPlansInput = {
    update: XOR<OrganizationUpdateWithoutCustomPlansInput, OrganizationUncheckedUpdateWithoutCustomPlansInput>
    create: XOR<OrganizationCreateWithoutCustomPlansInput, OrganizationUncheckedCreateWithoutCustomPlansInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutCustomPlansInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutCustomPlansInput, OrganizationUncheckedUpdateWithoutCustomPlansInput>
  }

  export type OrganizationUpdateWithoutCustomPlansInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutCustomPlansInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserUncheckedUpdateManyWithoutOrganizationNestedInput
    domainGroups?: DomainGroupUncheckedUpdateManyWithoutOrganizationNestedInput
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutOrganizationNestedInput
    invites?: OrganizationInviteUncheckedUpdateManyWithoutOrganizationNestedInput
    redirectRuleHitsHourly?: RedirectRuleHitsHourlyUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type UserCreateManyOrganizationInput = {
    id: string
    email: string
    passwordHash: string
    isOwner?: boolean
    emailVerifiedAt?: Date | string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    termsAcceptedAt?: Date | string | null
    privacyAcceptedAt?: Date | string | null
    ageConfirmedAt?: Date | string | null
    legalVersion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type DomainGroupCreateManyOrganizationInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type BillingCheckoutSessionCreateManyOrganizationInput = {
    id: string
    userId: string
    plan: string
    status?: $Enums.BillingCheckoutStatus
    providerCheckoutId?: string | null
    providerOrderId?: string | null
    providerSubscriptionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type CustomPlanCreateManyOrganizationInput = {
    id: string
    name: string
    description?: string | null
    monthlyVariantId?: string | null
    yearlyVariantId?: string | null
    limits: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectTestCreateManyOrganizationInput = {
    id: string
    domainGroupId: string
    pathWithQuery: string
    requestData: JsonNullValueInput | InputJsonValue
    expectedResult: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type OrganizationInviteCreateManyOrganizationInput = {
    id: string
    email: string
    tokenHash: string
    expiresAt: Date | string
    createdByUserId: string
    acceptedAt?: Date | string | null
    revokedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RedirectRuleHitsHourlyCreateManyOrganizationInput = {
    ruleId: string
    bucketStart: Date | string
    hits: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutUserNestedInput
    createdInvites?: OrganizationInviteUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutUserNestedInput
    createdInvites?: OrganizationInviteUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type UserUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    termsAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    privacyAcceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ageConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    legalVersion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DomainGroupUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domains?: DomainUpdateManyWithoutDomainGroupNestedInput
    redirectRules?: RedirectRuleUpdateManyWithoutDomainGroupNestedInput
    linkMaps?: LinkMapUpdateManyWithoutDomainGroupNestedInput
    redirectTests?: RedirectTestUpdateManyWithoutDomainGroupNestedInput
  }

  export type DomainGroupUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domains?: DomainUncheckedUpdateManyWithoutDomainGroupNestedInput
    redirectRules?: RedirectRuleUncheckedUpdateManyWithoutDomainGroupNestedInput
    linkMaps?: LinkMapUncheckedUpdateManyWithoutDomainGroupNestedInput
    redirectTests?: RedirectTestUncheckedUpdateManyWithoutDomainGroupNestedInput
  }

  export type DomainGroupUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BillingCheckoutSessionUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: EnumBillingCheckoutStatusFieldUpdateOperationsInput | $Enums.BillingCheckoutStatus
    providerCheckoutId?: NullableStringFieldUpdateOperationsInput | string | null
    providerOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    user?: UserUpdateOneRequiredWithoutCheckoutSessionsNestedInput
  }

  export type BillingCheckoutSessionUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: EnumBillingCheckoutStatusFieldUpdateOperationsInput | $Enums.BillingCheckoutStatus
    providerCheckoutId?: NullableStringFieldUpdateOperationsInput | string | null
    providerOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BillingCheckoutSessionUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: EnumBillingCheckoutStatusFieldUpdateOperationsInput | $Enums.BillingCheckoutStatus
    providerCheckoutId?: NullableStringFieldUpdateOperationsInput | string | null
    providerOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type CustomPlanUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    monthlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    limits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CustomPlanUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    monthlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    limits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CustomPlanUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    monthlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyVariantId?: NullableStringFieldUpdateOperationsInput | string | null
    limits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectTestUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    pathWithQuery?: StringFieldUpdateOperationsInput | string
    requestData?: JsonNullValueInput | InputJsonValue
    expectedResult?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domainGroup?: DomainGroupUpdateOneRequiredWithoutRedirectTestsNestedInput
  }

  export type RedirectTestUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    domainGroupId?: StringFieldUpdateOperationsInput | string
    pathWithQuery?: StringFieldUpdateOperationsInput | string
    requestData?: JsonNullValueInput | InputJsonValue
    expectedResult?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectTestUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    domainGroupId?: StringFieldUpdateOperationsInput | string
    pathWithQuery?: StringFieldUpdateOperationsInput | string
    requestData?: JsonNullValueInput | InputJsonValue
    expectedResult?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrganizationInviteUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedInvitesNestedInput
  }

  export type OrganizationInviteUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdByUserId?: StringFieldUpdateOperationsInput | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationInviteUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdByUserId?: StringFieldUpdateOperationsInput | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RedirectRuleHitsHourlyUpdateWithoutOrganizationInput = {
    bucketStart?: DateTimeFieldUpdateOperationsInput | Date | string
    hits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    redirectRule?: RedirectRuleUpdateOneRequiredWithoutHitsHourlyNestedInput
  }

  export type RedirectRuleHitsHourlyUncheckedUpdateWithoutOrganizationInput = {
    ruleId?: StringFieldUpdateOperationsInput | string
    bucketStart?: DateTimeFieldUpdateOperationsInput | Date | string
    hits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RedirectRuleHitsHourlyUncheckedUpdateManyWithoutOrganizationInput = {
    ruleId?: StringFieldUpdateOperationsInput | string
    bucketStart?: DateTimeFieldUpdateOperationsInput | Date | string
    hits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BillingCheckoutSessionCreateManyUserInput = {
    id: string
    organizationId: string
    plan: string
    status?: $Enums.BillingCheckoutStatus
    providerCheckoutId?: string | null
    providerOrderId?: string | null
    providerSubscriptionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrganizationInviteCreateManyCreatedByInput = {
    id: string
    organizationId: string
    email: string
    tokenHash: string
    expiresAt: Date | string
    acceptedAt?: Date | string | null
    revokedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BillingCheckoutSessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: EnumBillingCheckoutStatusFieldUpdateOperationsInput | $Enums.BillingCheckoutStatus
    providerCheckoutId?: NullableStringFieldUpdateOperationsInput | string | null
    providerOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    organization?: OrganizationUpdateOneRequiredWithoutCheckoutSessionsNestedInput
  }

  export type BillingCheckoutSessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: EnumBillingCheckoutStatusFieldUpdateOperationsInput | $Enums.BillingCheckoutStatus
    providerCheckoutId?: NullableStringFieldUpdateOperationsInput | string | null
    providerOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BillingCheckoutSessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: EnumBillingCheckoutStatusFieldUpdateOperationsInput | $Enums.BillingCheckoutStatus
    providerCheckoutId?: NullableStringFieldUpdateOperationsInput | string | null
    providerOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrganizationInviteUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutInvitesNestedInput
  }

  export type OrganizationInviteUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationInviteUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DomainCreateManyDomainGroupInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectRuleCreateManyDomainGroupInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    linkMapId?: string | null
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type LinkMapCreateManyDomainGroupInput = {
    id: string
    name: string
    caseSensitive?: boolean
    queryMatch?: $Enums.RedirectQueryMatch
    fallbackDestination?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectTestCreateManyDomainGroupInput = {
    id: string
    organizationId: string
    pathWithQuery: string
    requestData: JsonNullValueInput | InputJsonValue
    expectedResult: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type DomainUpdateWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DomainUncheckedUpdateWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DomainUncheckedUpdateManyWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectRuleUpdateWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    linkMap?: LinkMapUpdateOneWithoutRedirectRulesNestedInput
    hitsHourly?: RedirectRuleHitsHourlyUpdateManyWithoutRedirectRuleNestedInput
  }

  export type RedirectRuleUncheckedUpdateWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    linkMapId?: NullableStringFieldUpdateOperationsInput | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hitsHourly?: RedirectRuleHitsHourlyUncheckedUpdateManyWithoutRedirectRuleNestedInput
  }

  export type RedirectRuleUncheckedUpdateManyWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    linkMapId?: NullableStringFieldUpdateOperationsInput | string | null
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LinkMapUpdateWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    entries?: LinkMapEntryUpdateManyWithoutLinkMapNestedInput
    redirectRules?: RedirectRuleUpdateManyWithoutLinkMapNestedInput
  }

  export type LinkMapUncheckedUpdateWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    entries?: LinkMapEntryUncheckedUpdateManyWithoutLinkMapNestedInput
    redirectRules?: RedirectRuleUncheckedUpdateManyWithoutLinkMapNestedInput
  }

  export type LinkMapUncheckedUpdateManyWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    caseSensitive?: BoolFieldUpdateOperationsInput | boolean
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    fallbackDestination?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectTestUpdateWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    pathWithQuery?: StringFieldUpdateOperationsInput | string
    requestData?: JsonNullValueInput | InputJsonValue
    expectedResult?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutRedirectTestsNestedInput
  }

  export type RedirectTestUncheckedUpdateWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    pathWithQuery?: StringFieldUpdateOperationsInput | string
    requestData?: JsonNullValueInput | InputJsonValue
    expectedResult?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectTestUncheckedUpdateManyWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    pathWithQuery?: StringFieldUpdateOperationsInput | string
    requestData?: JsonNullValueInput | InputJsonValue
    expectedResult?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectRuleHitsHourlyCreateManyRedirectRuleInput = {
    organizationId: string
    bucketStart: Date | string
    hits: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RedirectRuleHitsHourlyUpdateWithoutRedirectRuleInput = {
    bucketStart?: DateTimeFieldUpdateOperationsInput | Date | string
    hits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutRedirectRuleHitsHourlyNestedInput
  }

  export type RedirectRuleHitsHourlyUncheckedUpdateWithoutRedirectRuleInput = {
    organizationId?: StringFieldUpdateOperationsInput | string
    bucketStart?: DateTimeFieldUpdateOperationsInput | Date | string
    hits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RedirectRuleHitsHourlyUncheckedUpdateManyWithoutRedirectRuleInput = {
    organizationId?: StringFieldUpdateOperationsInput | string
    bucketStart?: DateTimeFieldUpdateOperationsInput | Date | string
    hits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LinkMapEntryCreateManyLinkMapInput = {
    id: string
    key: string
    keyNormalized: string
    destination: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectRuleCreateManyLinkMapInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: $Enums.RedirectQueryMatch
    pathMatch?: $Enums.RedirectPathMatch
    isBlocked?: boolean
    blockedAt?: Date | string | null
    priority?: number
    domainGroupId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type LinkMapEntryUpdateWithoutLinkMapInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    keyNormalized?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LinkMapEntryUncheckedUpdateWithoutLinkMapInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    keyNormalized?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LinkMapEntryUncheckedUpdateManyWithoutLinkMapInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    keyNormalized?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectRuleUpdateWithoutLinkMapInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domainGroup?: DomainGroupUpdateOneRequiredWithoutRedirectRulesNestedInput
    hitsHourly?: RedirectRuleHitsHourlyUpdateManyWithoutRedirectRuleNestedInput
  }

  export type RedirectRuleUncheckedUpdateWithoutLinkMapInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    domainGroupId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hitsHourly?: RedirectRuleHitsHourlyUncheckedUpdateManyWithoutRedirectRuleNestedInput
  }

  export type RedirectRuleUncheckedUpdateManyWithoutLinkMapInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    queryMatch?: EnumRedirectQueryMatchFieldUpdateOperationsInput | $Enums.RedirectQueryMatch
    pathMatch?: EnumRedirectPathMatchFieldUpdateOperationsInput | $Enums.RedirectPathMatch
    isBlocked?: BoolFieldUpdateOperationsInput | boolean
    blockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    priority?: IntFieldUpdateOperationsInput | number
    domainGroupId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}