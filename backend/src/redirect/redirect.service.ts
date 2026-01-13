import express, { Request } from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PrismaService } from '../prisma.service';
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RuleValidatorService } from '../rule-validator/rule-validator.service';
import {
  CreateRedirectRuleDto,
  UpdateRedirectRuleDto,
} from '../zod-schames/redirect-rule.schemas';
import {
  CreateDomainDto,
  UpdateDomainDto,
} from '../zod-schames/domain.schemas';
import {
  CreateDomainGroupDto,
  UpdateDomainGroupDto,
} from '../zod-schames/domain-group.schemas';
import { AppEntity, createCustomCuid } from '../utils';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface RedirectRule {
  source: string | RegExp;
  destination: string;
}

type Manipulator = (val: string) => string;

@Injectable()
export class RedirectService {
  private readonly logger = new Logger(RedirectService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleValidator: RuleValidatorService,
  ) {}

  // --- Management Methods (CRUD) ---

  async listDomains(organizationId: string) {
    return this.prisma.domain.findMany({
      where: {
        deletedAt: null,
        domainGroup: {
          organizationId,
          deletedAt: null,
        },
      },
      include: {
        domainGroup: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDomainById(id: string, organizationId: string) {
    const domain = await this.prisma.domain.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      include: { domainGroup: true },
    });

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }
    return domain;
  }

  async createDomain(organizationId: string, data: CreateDomainDto) {
    // 1. Verify domain group exists and belongs to organization
    const domainGroup = await this.prisma.domainGroup.findFirst({
      where: {
        id: data.domainGroupId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!domainGroup) {
      throw new NotFoundException('Domain group not found');
    }

    // 2. Check duplicate name
    const existing = await this.prisma.domain.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException('Domain name already exists');
    }

    // 3. Create
    return this.prisma.domain.create({
      data: {
        id: createCustomCuid(AppEntity.Domain),
        name: data.name,
        domainGroupId: data.domainGroupId,
      },
      include: { domainGroup: true },
    });
  }

  async updateDomain(
    id: string,
    organizationId: string,
    data: UpdateDomainDto,
  ) {
    // 1. Verify domain exists
    const existing = await this.prisma.domain.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!existing) {
      throw new NotFoundException('Domain not found');
    }

    // 2. Check duplicates if name changes
    if (data.name && data.name !== existing.name) {
      const duplicate = await this.prisma.domain.findFirst({
        where: {
          name: data.name,
          deletedAt: null,
        },
      });

      if (duplicate) {
        throw new ConflictException('Domain name already exists');
      }
    }

    // 3. Verify new group if changing
    if (data.domainGroupId) {
      const newDomainGroup = await this.prisma.domainGroup.findFirst({
        where: {
          id: data.domainGroupId,
          organizationId,
          deletedAt: null,
        },
      });

      if (!newDomainGroup) {
        throw new NotFoundException('Domain group not found');
      }
    }

    // 4. Update
    return this.prisma.domain.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: { domainGroup: true },
    });
  }

  async deleteDomain(id: string, organizationId: string) {
    const existing = await this.prisma.domain.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!existing) {
      throw new NotFoundException('Domain not found');
    }

    await this.prisma.domain.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  async listDomainGroups(organizationId: string) {
    return this.prisma.domainGroup.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
        domains: {
          where: { deletedAt: null },
        },
        redirectRules: {
          where: { deletedAt: null },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDomainGroupById(id: string, organizationId: string) {
    const domainGroup = await this.prisma.domainGroup.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        domains: {
          where: { deletedAt: null },
        },
        redirectRules: {
          where: { deletedAt: null },
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!domainGroup) {
      throw new NotFoundException('Domain group not found');
    }
    return domainGroup;
  }

  async createDomainGroup(organizationId: string, data: CreateDomainGroupDto) {
    return this.prisma.domainGroup.create({
      data: {
        id: createCustomCuid(AppEntity.DomainGroup),
        name: data.name,
        organizationId,
      },
      include: {
        domains: true,
        redirectRules: true,
      },
    });
  }

  async updateDomainGroup(
    id: string,
    organizationId: string,
    data: UpdateDomainGroupDto,
  ) {
    // 1. Verify existence
    const existing = await this.prisma.domainGroup.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Domain group not found');
    }

    // 2. Update
    return this.prisma.domainGroup.update({
      where: { id },
      data: {
        name: data.name,
        updatedAt: new Date(),
      },
      include: {
        domains: { where: { deletedAt: null } },
        redirectRules: { where: { deletedAt: null } },
      },
    });
  }

  async deleteDomainGroup(id: string, organizationId: string) {
    const existing = await this.prisma.domainGroup.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Domain group not found');
    }

    await this.prisma.domainGroup.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return true;
  }

  async listRules(organizationId: string, domainGroupId?: string) {
    const where: any = {
      deletedAt: null,
      domainGroup: {
        organizationId,
        deletedAt: null,
      },
    };

    if (domainGroupId) {
      where.domainGroupId = domainGroupId;
    }

    return this.prisma.redirectRule.findMany({
      where,
      include: {
        domainGroup: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getRuleById(id: string, organizationId: string) {
    const rule = await this.prisma.redirectRule.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      include: { domainGroup: true },
    });

    if (!rule) {
      throw new NotFoundException('Redirect rule not found');
    }
    return rule;
  }

  async createRule(organizationId: string, data: CreateRedirectRuleDto) {
    // 1. Verify domain group
    const domainGroup = await this.prisma.domainGroup.findFirst({
      where: {
        id: data.domainGroupId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!domainGroup) {
      throw new NotFoundException('Domain group not found');
    }

    // 2. Validate logic
    const validationResult = this.ruleValidator.validate(
      data.source,
      data.destination,
    );
    if (!validationResult.isValid) {
      throw new BadRequestException({
        message: 'Rule validation failed',
        details: validationResult.errors,
        warnings: validationResult.warnings,
      });
    }

    // 3. Create
    const rule = await this.prisma.redirectRule.create({
      data: {
        id: createCustomCuid(AppEntity.RedirectRule, 40),
        source: data.source,
        destination: data.destination,
        statusCode: data.statusCode,
        priority: data.priority,
        domainGroupId: data.domainGroupId,
      },
      include: { domainGroup: true },
    });

    return { rule, warnings: validationResult.warnings };
  }

  async updateRule(
    id: string,
    organizationId: string,
    data: UpdateRedirectRuleDto,
  ) {
    // 1. Verify existence
    const existing = await this.prisma.redirectRule.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!existing) {
      throw new NotFoundException('Redirect rule not found');
    }

    // 2. Validate logic if fields changed
    const sourceToValidate = data.source ?? existing.source;
    const destinationToValidate = data.destination ?? existing.destination;

    const validationResult = this.ruleValidator.validate(
      sourceToValidate,
      destinationToValidate,
    );
    if (!validationResult.isValid) {
      throw new BadRequestException({
        message: 'Rule validation failed',
        details: validationResult.errors,
        warnings: validationResult.warnings,
      });
    }

    // 3. Update
    const rule = await this.prisma.redirectRule.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: { domainGroup: true },
    });

    return { rule, warnings: validationResult.warnings };
  }

  async deleteRule(id: string, organizationId: string) {
    const existing = await this.prisma.redirectRule.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!existing) {
      throw new NotFoundException('Redirect rule not found');
    }

    await this.prisma.redirectRule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  // We removed hardcoded rules from here.
  // Now rules are passed directly to the getRedirect method.

  static readonly manipulators: Record<string, Manipulator> = {
    to_lower_case: (val) => val.toLowerCase(),
    to_upper_case: (val) => val.toUpperCase(),
    url_encode: (val) => encodeURIComponent(val),
    url_decode: (val) => decodeURIComponent(val),
    base64_encode: (val) => Buffer.from(val).toString('base64'),
    auto_trailing_slash: (val) => (val && !val.endsWith('/') ? `${val}/` : val),
    // Math manipulators
    multiply_10: (val) => String(Number(val || 0) * 10),
    divide_10: (val) => String(Number(val || 0) / 10),
    add_10: (val) => String(Number(val || 0) + 10),
    multiply_2: (val) => String(Number(val || 0) * 2),
    random: RedirectService.processRandom,
    round: (val) => String(Math.round(Number(val || 0))),
  };

  async applyRedirect(req: express.Request, res: express.Response) {
    const hostname = req.hostname;

    // 1. Query the database for the Domain matching the hostname
    const domain = await this.prisma.domain.findFirst({
      where: {
        name: hostname,
        deletedAt: null,
      },
      include: {
        domainGroup: {
          include: {
            redirectRules: {
              where: {
                deletedAt: null,
              },
              orderBy: [
                { priority: 'desc' }, // Higher priority rules evaluated first
                { createdAt: 'desc' }, // In case of tie: newer wins
              ],
            },
          },
        },
      },
    });

    // If no domain found, return 404
    if (!domain) {
      res.status(404).json({
        message: `Domain ${hostname} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
      return;
    }

    // 2. Convert database rules to RedirectRule format
    const rules: RedirectRule[] = domain.domainGroup.redirectRules.map(
      (rule) => {
        // Check if source is a regex pattern (starts with / and has closing /)
        if (rule.source.startsWith('/') && rule.source.lastIndexOf('/') > 0) {
          const lastSlashIndex = rule.source.lastIndexOf('/');
          const pattern = rule.source.substring(1, lastSlashIndex);
          const flags = rule.source.substring(lastSlashIndex + 1);
          return {
            source: new RegExp(pattern, flags),
            destination: rule.destination,
          };
        }
        return {
          source: rule.source,
          destination: rule.destination,
        };
      },
    );

    // 3. Pass rules to getRedirect to find a match
    const target = await this.getRedirect(req, rules);

    // 4. Action: redirect or return 404
    if (target) {
      res.redirect(302, target);
      return;
    }

    res.status(404).json({
      message: `Target for ${req.method} ${req.url} does not exist.`,
      error: 'Not Found',
      statusCode: 404,
    });
  }

  async getRedirect(
    req: Request,
    rules: RedirectRule[],
  ): Promise<string | null> {
    const url = this.getRequestUrl(req);
    const variables = this.extractVariables(req, url);

    for (const rule of rules) {
      const result = this.processRule(rule, req.path, variables);
      if (result) return result;
    }

    return null;
  }

  private getRequestUrl(req: Request): URL {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    return new URL(fullUrl);
  }

  private extractVariables(
    req: Request,
    url: URL,
  ): Record<string, string | undefined> {
    const hostParts = url.hostname.split('.');
    const domainRoot =
      hostParts.length >= 2 ? hostParts[hostParts.length - 2] : hostParts[0];
    const subdomains = hostParts.length > 2 ? hostParts.slice(0, -2) : [];
    const path = url.pathname.replace(/^\//, '');
    const segments = path.split('/').filter(Boolean);

    const variables: Record<string, string | undefined> = {
      'domain.fqdn': url.hostname,
      'domain.label': hostParts.slice(0, -1).join('.'),
      'domain.root': domainRoot,
      'domain.extension': hostParts.slice(1).join('.'),
      'domain.subdomain': subdomains.join('.'),
      path: path,
      method: req.method,
      scheme: req.protocol,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('User-Agent') || '',
      // Special static variables
      random: String(Math.floor(Math.random() * 1000000)),
      // Geo placeholder (Mock)
      'geo.country': this.getCountryByIp(req.ip || req.socket.remoteAddress),
    };

    segments.forEach((seg, i) => (variables[`segments.${i}`] = seg));
    subdomains.forEach((sub, i) => (variables[`domain.subdomains.${i}`] = sub));
    url.searchParams.forEach(
      (value, key) => (variables[`query.${key}`] = value),
    );

    return variables;
  }

  private getCountryByIp(ip: string | undefined): string {
    // TODO: Integrate with MaxMind GeoIP or similar service
    // For now, we return 'US' as default, or 'PL' if localhost for testing
    if (ip === '127.0.0.1' || ip === '::1') return 'PL';
    return 'US';
  }

  private processRule(
    rule: RedirectRule,
    currentPath: string,
    variables: Record<string, string | undefined>,
  ): string | null {
    let target = rule.destination;
    let isMatch = false;

    if (rule.source instanceof RegExp) {
      const match = currentPath.match(rule.source);
      if (match) {
        isMatch = true;
        match.forEach((val, index) => {
          target = target.replace(new RegExp(`\\$${index}`, 'g'), val);
        });
      }
    } else if (rule.source === '*' || currentPath === rule.source) {
      isMatch = true;
    }

    if (!isMatch) return null;

    // 1. Replace variables first to resolve values for logic
    const resolvedTarget = this.replacePlaceholders(target, variables);

    // 2. Process conditional logic (Traffic splitting, A/B testing, etc.)
    return this.processConditionals(resolvedTarget);
  }

  /**
   * Recursively processes conditional logic in the string.
   * Syntax: Condition ? TrueValue : FalseValue
   * Supports nesting: Cond1 ? (Cond2 ? A : B) : C
   */
  private processConditionals(template: string): string {
    let trimmed = template.trim();

    // Remove outer parentheses if they wrap the entire expression
    while (this.hasOuterParentheses(trimmed)) {
      trimmed = trimmed.substring(1, trimmed.length - 1).trim();
    }

    // Simple check if it might be a conditional
    if (!trimmed.includes('?') || !trimmed.includes(':')) {
      return trimmed;
    }

    const split = this.splitConditional(trimmed);
    if (!split) {
      return trimmed;
    }

    const { condition, truePart, falsePart } = split;
    const isTrue = this.evaluateCondition(condition);

    // Recursively process the chosen branch
    return this.processConditionals(isTrue ? truePart : falsePart);
  }

  /**
   * Check if string has matching outer parentheses that wrap the entire expression
   */
  private hasOuterParentheses(str: string): boolean {
    const trimmed = str.trim();
    if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
      return false;
    }

    // Check if first '(' matches the last ')'
    let balance = 0;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '(') balance++;
      else if (trimmed[i] === ')') balance--;

      // If balance hits 0 before the end, these aren't matching outer parens
      if (balance === 0 && i < trimmed.length - 1) {
        return false;
      }
    }

    // They are matching outer parens
    return true;
  }

  /**
   * Parses the string to find the top-level ternary operator components.
   * Respects parentheses nesting.
   */
  private splitConditional(
    template: string,
  ): { condition: string; truePart: string; falsePart: string } | null {
    let balance = 0;
    let questionMarkIndex = -1;
    let colonIndex = -1;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    // 1. Find the split point (?)
    for (let i = 0; i < template.length; i++) {
      const char = template[i];

      // Track quotes
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      }

      if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') balance++;
        else if (char === ')') balance--;
        else if (char === '?' && balance === 0) {
          questionMarkIndex = i;
          break;
        }
      }
    }

    if (questionMarkIndex === -1) return null;

    // 2. Find the corresponding colon (:) - skip URL colons (://)
    balance = 0;
    inSingleQuote = false;
    inDoubleQuote = false;
    for (let i = questionMarkIndex + 1; i < template.length; i++) {
      const char = template[i];

      // Track quotes
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      }

      if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') balance++;
        else if (char === ')') balance--;
        else if (char === ':' && balance === 0) {
          // Skip URL colons (check if followed by //)
          if (template.substring(i + 1, i + 3) === '//') {
            continue;
          }
          colonIndex = i;
          break;
        }
      }
    }

    if (colonIndex === -1) return null;

    return {
      condition: template.substring(0, questionMarkIndex).trim(),
      truePart: template.substring(questionMarkIndex + 1, colonIndex).trim(),
      falsePart: template.substring(colonIndex + 1).trim(),
    };
  }

  /**
   * Evaluates a single condition string.
   * Supports:
   * - Comparisons: ==, !=, <, >, <=, >=
   * - Regex Match: ~=
   * - String literals (quoted) and Numbers
   * - Date/Time functions: time(), datetime(date, timezone?)
   */
  private evaluateCondition(condition: string): boolean {
    const preprocessed = this.preprocessCondition(condition.trim());
    const operatorMatch = this.findOperatorPosition(preprocessed);

    if (!operatorMatch) {
      this.logger.debug(`No operator found in condition: ${condition}`);
      return false;
    }

    const { leftPart, operator, rightPart } = operatorMatch;
    const left = this.parseValue(leftPart);
    const right = this.parseValue(rightPart);

    // Temporary debug log
    this.logger.debug(
      `Evaluating: ${JSON.stringify(left)} ${operator} ${JSON.stringify(right)}`,
    );

    switch (operator) {
      case '==':
        return left == right;
      case '!=':
        return left != right;
      case '<':
        return left < right;
      case '>':
        return left > right;
      case '<=':
        return left <= right;
      case '>=':
        return left >= right;
      case '~=': // Regex match
        try {
          // Support regex with flags: value ~= /pattern/flags format
          let pattern = String(right);
          let flags = '';

          // Check if it's in /pattern/flags format
          const regexMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
          if (regexMatch) {
            pattern = regexMatch[1];
            flags = regexMatch[2];
          }

          return new RegExp(pattern, flags).test(String(left));
        } catch {
          return false;
        }
      case 'includes':
        return String(left).includes(String(right));
      default:
        return false;
    }
  }

  /**
   * Find operator position respecting quotes and parentheses
   */
  private findOperatorPosition(condition: string): {
    leftPart: string;
    operator: string;
    rightPart: string;
  } | null {
    const operators = ['==', '!=', '<=', '>=', '~=', 'includes', '<', '>'];

    let inSingleQuote = false;
    let inDoubleQuote = false;
    let parenDepth = 0;

    // Scan for operators that are NOT inside quotes or parentheses
    for (let i = 0; i < condition.length; i++) {
      const char = condition[i];

      // Track quotes
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      }

      // Track parentheses (only when not in quotes)
      if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') parenDepth++;
        else if (char === ')') parenDepth--;
      }

      // Look for operators only when not in quotes/parens
      if (!inSingleQuote && !inDoubleQuote && parenDepth === 0) {
        // Try each operator (longest first to match '==' before '=')
        for (const op of operators) {
          if (condition.substring(i, i + op.length) === op) {
            return {
              leftPart: condition.substring(0, i).trim(),
              operator: op,
              rightPart: condition.substring(i + op.length).trim(),
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Preprocess condition to handle parentheses wrapping
   */
  private preprocessCondition(condition: string): string {
    // Remove wrapping parentheses if they exist
    const trimmed = condition.trim();
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      // Check if these are matching outer parens
      let balance = 0;
      for (let i = 0; i < trimmed.length; i++) {
        if (trimmed[i] === '(') balance++;
        if (trimmed[i] === ')') balance--;
        // If balance reaches 0 before the end, these aren't outer parens
        if (balance === 0 && i < trimmed.length - 1) {
          return trimmed;
        }
      }
      // They are outer parens, remove them
      return this.preprocessCondition(trimmed.substring(1, trimmed.length - 1));
    }
    return trimmed;
  }

  /**
   * Parse a value from condition string (handles time(), datetime(), strings, numbers)
   */
  private parseValue(val: string): string | number {
    const trimmed = val.trim();

    // 1. Check for time()
    if (/^time\s*\(\s*\)$/.test(trimmed)) {
      return Date.now();
    }

    // 2. Check for datetime('date', 'timezone'?)
    const dtMatch = trimmed.match(
      /^datetime\s*\(\s*(['"])(.*?)\1\s*(?:,\s*(['"])(.*?)\3)?\s*\)$/,
    );

    if (dtMatch) {
      const dateStr = dtMatch[2];
      const tz = dtMatch[4];

      let parsed: dayjs.Dayjs | undefined;
      if (tz) {
        parsed = dayjs.tz(dateStr, tz);
      } else {
        parsed = dayjs.utc(dateStr);
      }

      if (!parsed.isValid()) {
        this.logger.warn(
          `Invalid date in rule condition: ${dateStr} (tz: ${tz || 'UTC'})`,
        );
        return NaN;
      }

      return parsed.valueOf();
    }

    // 3. Remove surrounding quotes for strings
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.substring(1, trimmed.length - 1);
    }

    // 4. Try parsing as number - MUST be before returning trimmed
    const num = Number(trimmed);
    if (!isNaN(num)) {
      return num; // Return number, not trimmed string!
    }

    // 5. Return as string if not a number
    return trimmed;
  }

  private replacePlaceholders(
    template: string,
    variables: Record<string, string | undefined>,
  ): string {
    const result = template.replace(
      /(?<!\{)\{([^{}]+)\}(?!\})/g,
      (match, content: string) => {
        const lastColonIndex: number = content.lastIndexOf(':');
        const key =
          lastColonIndex === -1
            ? content
            : content.substring(0, lastColonIndex);
        const modifierChain =
          lastColonIndex === -1
            ? undefined
            : content.substring(lastColonIndex + 1);

        let value = key ? variables[key] : '';

        if (value === undefined && modifierChain) {
          value = key;
        }

        if (value === undefined && key && !modifierChain) return match;

        if (modifierChain) {
          return this.applyModifiers(value ?? '', modifierChain);
        }

        return value ?? '';
      },
    );

    return result.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
  }

  private applyModifiers(initialValue: string, modifierChain: string): string {
    const modifiers = modifierChain.split('.');
    return modifiers.reduce((acc, mod) => {
      const manipulator = RedirectService.manipulators[mod];
      if (manipulator) {
        try {
          return manipulator(acc);
        } catch (e: any) {
          this.logger.error(`Error applying manipulator ${mod}`, e?.stack);
          return acc;
        }
      }
      this.logger.warn(`Unknown manipulator: ${mod}`);
      return acc;
    }, initialValue);
  }

  /**
   * Helper function to generate random number based on input string.
   * Input formats:
   * - "min:max" (e.g. "-10:20") -> random between -10 and 20
   * - "max" (e.g. "100") -> random between 0 and 100
   * - "" (empty) -> random between 0 and MAX_SAFE_INTEGER
   */
  private static processRandom(val: string): string {
    let min = 0;
    let max = Number.MAX_SAFE_INTEGER;

    if (val && val.includes(':')) {
      const parts = val.split(':');
      if (parts.length === 2) {
        const parsedMin = parseInt(parts[0], 10);
        const parsedMax = parseInt(parts[1], 10);
        if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
          min = parsedMin;
          max = parsedMax;
        }
      }
    } else if (val) {
      const parsedMax = parseInt(val, 10);
      if (!isNaN(parsedMax)) {
        max = parsedMax;
      }
    }

    if (min > max) [min, max] = [max, min];

    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }
}
