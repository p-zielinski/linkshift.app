
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
 * Model BillingCheckoutSession
 * 
 */
export type BillingCheckoutSession = $Result.DefaultSelection<Prisma.$BillingCheckoutSessionPayload>

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
   * `prisma.billingCheckoutSession`: Exposes CRUD operations for the **BillingCheckoutSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BillingCheckoutSessions
    * const billingCheckoutSessions = await prisma.billingCheckoutSession.findMany()
    * ```
    */
  get billingCheckoutSession(): Prisma.BillingCheckoutSessionDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 7.3.0
   * Query Engine version: 9d6ad21cbbceab97458517b147a6a09ff43aa735
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
    DomainGroup: 'DomainGroup',
    Domain: 'Domain',
    RedirectRule: 'RedirectRule',
    BillingCheckoutSession: 'BillingCheckoutSession'
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
      modelProps: "organization" | "user" | "domainGroup" | "domain" | "redirectRule" | "billingCheckoutSession"
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
    domainGroup?: DomainGroupOmit
    domain?: DomainOmit
    redirectRule?: RedirectRuleOmit
    billingCheckoutSession?: BillingCheckoutSessionOmit
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
  }

  export type OrganizationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | OrganizationCountOutputTypeCountUsersArgs
    domainGroups?: boolean | OrganizationCountOutputTypeCountDomainGroupsArgs
    checkoutSessions?: boolean | OrganizationCountOutputTypeCountCheckoutSessionsArgs
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
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    checkoutSessions: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    checkoutSessions?: boolean | UserCountOutputTypeCountCheckoutSessionsArgs
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
   * Count Type DomainGroupCountOutputType
   */

  export type DomainGroupCountOutputType = {
    domains: number
    redirectRules: number
  }

  export type DomainGroupCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domains?: boolean | DomainGroupCountOutputTypeCountDomainsArgs
    redirectRules?: boolean | DomainGroupCountOutputTypeCountRedirectRulesArgs
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
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    checkoutSessions?: boolean | User$checkoutSessionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    organizationId?: boolean
    isOwner?: boolean
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
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "organizationId" | "isOwner" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    checkoutSessions?: boolean | User$checkoutSessionsArgs<ExtArgs>
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
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      organizationId: string
      isOwner: boolean
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
    priority?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["redirectRule"]>

  export type RedirectRuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    destination?: boolean
    statusCode?: boolean
    matchMethod?: boolean
    priority?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["redirectRule"]>

  export type RedirectRuleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    destination?: boolean
    statusCode?: boolean
    matchMethod?: boolean
    priority?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["redirectRule"]>

  export type RedirectRuleSelectScalar = {
    id?: boolean
    source?: boolean
    destination?: boolean
    statusCode?: boolean
    matchMethod?: boolean
    priority?: boolean
    domainGroupId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type RedirectRuleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "source" | "destination" | "statusCode" | "matchMethod" | "priority" | "domainGroupId" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["redirectRule"]>
  export type RedirectRuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }
  export type RedirectRuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }
  export type RedirectRuleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    domainGroup?: boolean | DomainGroupDefaultArgs<ExtArgs>
  }

  export type $RedirectRulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RedirectRule"
    objects: {
      domainGroup: Prisma.$DomainGroupPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      source: string
      destination: string
      statusCode: number
      matchMethod: $Enums.HttpMethod[]
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
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


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
    priority: 'priority',
    domainGroupId: 'domainGroupId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type RedirectRuleScalarFieldEnum = (typeof RedirectRuleScalarFieldEnum)[keyof typeof RedirectRuleScalarFieldEnum]


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
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    checkoutSessions?: BillingCheckoutSessionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    organizationId?: SortOrder
    isOwner?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    organization?: OrganizationOrderByWithRelationInput
    checkoutSessions?: BillingCheckoutSessionOrderByRelationAggregateInput
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
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    checkoutSessions?: BillingCheckoutSessionListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    organizationId?: SortOrder
    isOwner?: SortOrder
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
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
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
    priority?: IntFilter<"RedirectRule"> | number
    domainGroupId?: StringFilter<"RedirectRule"> | string
    createdAt?: DateTimeFilter<"RedirectRule"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectRule"> | Date | string
    deletedAt?: DateTimeNullableFilter<"RedirectRule"> | Date | string | null
    domainGroup?: XOR<DomainGroupScalarRelationFilter, DomainGroupWhereInput>
  }

  export type RedirectRuleOrderByWithRelationInput = {
    id?: SortOrder
    source?: SortOrder
    destination?: SortOrder
    statusCode?: SortOrder
    matchMethod?: SortOrder
    priority?: SortOrder
    domainGroupId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    domainGroup?: DomainGroupOrderByWithRelationInput
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
    priority?: IntFilter<"RedirectRule"> | number
    domainGroupId?: StringFilter<"RedirectRule"> | string
    createdAt?: DateTimeFilter<"RedirectRule"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectRule"> | Date | string
    deletedAt?: DateTimeNullableFilter<"RedirectRule"> | Date | string | null
    domainGroup?: XOR<DomainGroupScalarRelationFilter, DomainGroupWhereInput>
  }, "id" | "priority_createdAt_id">

  export type RedirectRuleOrderByWithAggregationInput = {
    id?: SortOrder
    source?: SortOrder
    destination?: SortOrder
    statusCode?: SortOrder
    matchMethod?: SortOrder
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
    priority?: IntWithAggregatesFilter<"RedirectRule"> | number
    domainGroupId?: StringWithAggregatesFilter<"RedirectRule"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RedirectRule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RedirectRule"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"RedirectRule"> | Date | string | null
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
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutUsersInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id: string
    email: string
    passwordHash: string
    organizationId: string
    isOwner?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id: string
    email: string
    passwordHash: string
    organizationId: string
    isOwner?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
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
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domainGroup: DomainGroupCreateNestedOneWithoutRedirectRulesInput
  }

  export type RedirectRuleUncheckedCreateInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    priority?: number
    domainGroupId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectRuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domainGroup?: DomainGroupUpdateOneRequiredWithoutRedirectRulesNestedInput
  }

  export type RedirectRuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    priority?: IntFieldUpdateOperationsInput | number
    domainGroupId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectRuleCreateManyInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
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
    priority?: IntFieldUpdateOperationsInput | number
    domainGroupId?: StringFieldUpdateOperationsInput | string
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

  export type DomainOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RedirectRuleOrderByRelationAggregateInput = {
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

  export type EnumBillingCheckoutStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCheckoutStatus | EnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCheckoutStatusFilter<$PrismaModel> | $Enums.BillingCheckoutStatus
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

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
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

  export type BillingCheckoutSessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<BillingCheckoutSessionCreateWithoutUserInput, BillingCheckoutSessionUncheckedCreateWithoutUserInput> | BillingCheckoutSessionCreateWithoutUserInput[] | BillingCheckoutSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BillingCheckoutSessionCreateOrConnectWithoutUserInput | BillingCheckoutSessionCreateOrConnectWithoutUserInput[]
    createMany?: BillingCheckoutSessionCreateManyUserInputEnvelope
    connect?: BillingCheckoutSessionWhereUniqueInput | BillingCheckoutSessionWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
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

  export type DomainGroupUpdateOneRequiredWithoutRedirectRulesNestedInput = {
    create?: XOR<DomainGroupCreateWithoutRedirectRulesInput, DomainGroupUncheckedCreateWithoutRedirectRulesInput>
    connectOrCreate?: DomainGroupCreateOrConnectWithoutRedirectRulesInput
    upsert?: DomainGroupUpsertWithoutRedirectRulesInput
    connect?: DomainGroupWhereUniqueInput
    update?: XOR<XOR<DomainGroupUpdateToOneWithWhereWithoutRedirectRulesInput, DomainGroupUpdateWithoutRedirectRulesInput>, DomainGroupUncheckedUpdateWithoutRedirectRulesInput>
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

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedEnumBillingCheckoutStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCheckoutStatus | EnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCheckoutStatusFilter<$PrismaModel> | $Enums.BillingCheckoutStatus
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

  export type NestedEnumBillingCheckoutStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCheckoutStatus | EnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCheckoutStatus[] | ListEnumBillingCheckoutStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCheckoutStatusWithAggregatesFilter<$PrismaModel> | $Enums.BillingCheckoutStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBillingCheckoutStatusFilter<$PrismaModel>
    _max?: NestedEnumBillingCheckoutStatusFilter<$PrismaModel>
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

  export type UserCreateWithoutOrganizationInput = {
    id: string
    email: string
    passwordHash: string
    isOwner?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOrganizationInput = {
    id: string
    email: string
    passwordHash: string
    isOwner?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    checkoutSessions?: BillingCheckoutSessionUncheckedCreateNestedManyWithoutUserInput
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
  }

  export type DomainGroupUncheckedCreateWithoutOrganizationInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domains?: DomainUncheckedCreateNestedManyWithoutDomainGroupInput
    redirectRules?: RedirectRuleUncheckedCreateNestedManyWithoutDomainGroupInput
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

  export type OrganizationCreateWithoutUsersInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    domainGroups?: DomainGroupCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutOrganizationInput
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

  export type OrganizationCreateWithoutDomainGroupsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    users?: UserCreateNestedManyWithoutOrganizationInput
    checkoutSessions?: BillingCheckoutSessionCreateNestedManyWithoutOrganizationInput
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
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectRuleUncheckedCreateWithoutDomainGroupInput = {
    id: string
    source: string
    destination: string
    statusCode?: number
    matchMethod?: RedirectRuleCreatematchMethodInput | $Enums.HttpMethod[]
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type RedirectRuleCreateOrConnectWithoutDomainGroupInput = {
    where: RedirectRuleWhereUniqueInput
    create: XOR<RedirectRuleCreateWithoutDomainGroupInput, RedirectRuleUncheckedCreateWithoutDomainGroupInput>
  }

  export type RedirectRuleCreateManyDomainGroupInputEnvelope = {
    data: RedirectRuleCreateManyDomainGroupInput | RedirectRuleCreateManyDomainGroupInput[]
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
    priority?: IntFilter<"RedirectRule"> | number
    domainGroupId?: StringFilter<"RedirectRule"> | string
    createdAt?: DateTimeFilter<"RedirectRule"> | Date | string
    updatedAt?: DateTimeFilter<"RedirectRule"> | Date | string
    deletedAt?: DateTimeNullableFilter<"RedirectRule"> | Date | string | null
  }

  export type DomainGroupCreateWithoutDomainsInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutDomainGroupsInput
    redirectRules?: RedirectRuleCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupUncheckedCreateWithoutDomainsInput = {
    id: string
    name: string
    organizationId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    redirectRules?: RedirectRuleUncheckedCreateNestedManyWithoutDomainGroupInput
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
  }

  export type DomainGroupUncheckedUpdateWithoutDomainsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    redirectRules?: RedirectRuleUncheckedUpdateManyWithoutDomainGroupNestedInput
  }

  export type DomainGroupCreateWithoutRedirectRulesInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutDomainGroupsInput
    domains?: DomainCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupUncheckedCreateWithoutRedirectRulesInput = {
    id: string
    name: string
    organizationId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    domains?: DomainUncheckedCreateNestedManyWithoutDomainGroupInput
  }

  export type DomainGroupCreateOrConnectWithoutRedirectRulesInput = {
    where: DomainGroupWhereUniqueInput
    create: XOR<DomainGroupCreateWithoutRedirectRulesInput, DomainGroupUncheckedCreateWithoutRedirectRulesInput>
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
  }

  export type DomainGroupUncheckedUpdateWithoutRedirectRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domains?: DomainUncheckedUpdateManyWithoutDomainGroupNestedInput
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
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    organization: OrganizationCreateNestedOneWithoutUsersInput
  }

  export type UserUncheckedCreateWithoutCheckoutSessionsInput = {
    id: string
    email: string
    passwordHash: string
    organizationId: string
    isOwner?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
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
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    organization?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateWithoutCheckoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserCreateManyOrganizationInput = {
    id: string
    email: string
    passwordHash: string
    isOwner?: boolean
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

  export type UserUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkoutSessions?: BillingCheckoutSessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkoutSessions?: BillingCheckoutSessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    isOwner?: BoolFieldUpdateOperationsInput | boolean
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
  }

  export type DomainGroupUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domains?: DomainUncheckedUpdateManyWithoutDomainGroupNestedInput
    redirectRules?: RedirectRuleUncheckedUpdateManyWithoutDomainGroupNestedInput
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
    priority?: number
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
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectRuleUncheckedUpdateWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RedirectRuleUncheckedUpdateManyWithoutDomainGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    matchMethod?: RedirectRuleUpdatematchMethodInput | $Enums.HttpMethod[]
    priority?: IntFieldUpdateOperationsInput | number
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