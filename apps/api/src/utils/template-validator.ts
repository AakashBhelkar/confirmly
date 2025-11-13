import { ITemplate } from '../models/Template';
import { AppError } from '../middlewares/error-handler';

/**
 * Validate template data
 */
export function validateTemplate(template: Partial<ITemplate>): void {
  if (!template.name || template.name.trim().length === 0) {
    throw new AppError(400, 'INVALID_TEMPLATE', 'Template name is required');
  }

  if (!template.channel || !['whatsapp', 'sms', 'email'].includes(template.channel)) {
    throw new AppError(400, 'INVALID_TEMPLATE', 'Channel must be whatsapp, sms, or email');
  }

  if (!template.content || template.content.trim().length === 0) {
    throw new AppError(400, 'INVALID_TEMPLATE', 'Template content is required');
  }

  // Validate WhatsApp template format
  if (template.channel === 'whatsapp') {
    validateWhatsAppTemplate(template.content);
  }

  // Validate SMS length
  if (template.channel === 'sms' && template.content.length > 160) {
    throw new AppError(400, 'INVALID_TEMPLATE', 'SMS template must be 160 characters or less');
  }

  // Extract and validate variables
  const variables = extractVariables(template.content);
  if (template.variables) {
    const missingVars = variables.filter((v) => !template.variables!.includes(v));
    if (missingVars.length > 0) {
      throw new AppError(
        400,
        'INVALID_TEMPLATE',
        `Template uses variables not declared: ${missingVars.join(', ')}`
      );
    }
  }
}

/**
 * Validate WhatsApp template format
 */
function validateWhatsAppTemplate(content: string): void {
  // WhatsApp templates should not contain certain characters
  const invalidChars = /[<>{}]/g;
  if (invalidChars.test(content)) {
    throw new AppError(
      400,
      'INVALID_TEMPLATE',
      'WhatsApp templates cannot contain <, >, {, or } characters. Use {{variable}} format instead.'
    );
  }

  // Check for proper variable format
  const variableRegex = /\{\{(\w+)\}\}/g;
  const matches = content.match(variableRegex);
  if (matches) {
    matches.forEach((match) => {
      const varName = match.replace(/[{}]/g, '');
      if (varName.length === 0 || varName.length > 50) {
        throw new AppError(400, 'INVALID_TEMPLATE', `Invalid variable format: ${match}`);
      }
    });
  }
}

/**
 * Extract variables from template content
 */
export function extractVariables(content: string): string[] {
  const variableRegex = /\{\{(\w+)\}\}/g;
  const matches = content.match(variableRegex);
  if (!matches) {
    return [];
  }

  const variables = matches.map((match) => match.replace(/[{}]/g, ''));
  return [...new Set(variables)]; // Remove duplicates
}

/**
 * Validate template variables against provided data
 */
export function validateTemplateVariables(
  template: ITemplate,
  variables: Record<string, string>
): void {
  const requiredVars = template.variables || [];
  const missingVars = requiredVars.filter((v) => !(v in variables) || !variables[v]);

  if (missingVars.length > 0) {
    throw new AppError(
      400,
      'MISSING_VARIABLES',
      `Missing required variables: ${missingVars.join(', ')}`
    );
  }
}

