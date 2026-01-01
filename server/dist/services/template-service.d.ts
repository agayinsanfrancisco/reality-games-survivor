/**
 * Template Service
 * Fetches email templates from the database and renders them with variables
 */
interface EmailTemplate {
    id: string;
    slug: string;
    name: string;
    subject: string;
    html_body: string;
    text_body: string | null;
    available_variables: string[];
    is_active: boolean;
}
/**
 * Get an email template by slug
 */
export declare function getEmailTemplate(slug: string): Promise<EmailTemplate | null>;
/**
 * Render a template with variables
 */
export declare function renderTemplate(template: {
    subject: string;
    html_body: string;
}, variables: Record<string, string | number | boolean>): {
    subject: string;
    html: string;
};
/**
 * Get and render an email template
 */
export declare function getRenderedTemplate(slug: string, variables: Record<string, string | number | boolean>): Promise<{
    subject: string;
    html: string;
} | null>;
/**
 * Clear template cache (useful after updates)
 */
export declare function clearTemplateCache(slug?: string): void;
/**
 * Get all active email templates
 */
export declare function getAllEmailTemplates(): Promise<EmailTemplate[]>;
export {};
//# sourceMappingURL=template-service.d.ts.map