/**
 * Template Service
 * Fetches email templates from the database and renders them with variables
 */
import { supabaseAdmin } from '../config/supabase.js';
// Cache templates for 5 minutes to reduce database calls
const templateCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
/**
 * Get an email template by slug
 */
export async function getEmailTemplate(slug) {
    // Check cache first
    const cached = templateCache.get(slug);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
        return cached.template;
    }
    try {
        const { data, error } = await supabaseAdmin
            .from('email_templates')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();
        if (error || !data) {
            console.warn(`[TemplateService] Template not found: ${slug}`);
            return null;
        }
        // Cache the template
        templateCache.set(slug, { template: data, cachedAt: Date.now() });
        return data;
    }
    catch (err) {
        console.error(`[TemplateService] Error fetching template ${slug}:`, err);
        return null;
    }
}
/**
 * Render a template with variables
 */
export function renderTemplate(template, variables) {
    let subject = template.subject;
    let html = template.html_body;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, String(value));
        html = html.replace(regex, String(value));
    }
    // Handle simple conditionals like {{#if missedEpisodes}}...{{/if}}
    html = html.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (_, varName, content) => {
        const value = variables[varName];
        return value ? content : '';
    });
    return { subject, html };
}
/**
 * Get and render an email template
 */
export async function getRenderedTemplate(slug, variables) {
    const template = await getEmailTemplate(slug);
    if (!template)
        return null;
    return renderTemplate(template, variables);
}
/**
 * Clear template cache (useful after updates)
 */
export function clearTemplateCache(slug) {
    if (slug) {
        templateCache.delete(slug);
    }
    else {
        templateCache.clear();
    }
}
/**
 * Get all active email templates
 */
export async function getAllEmailTemplates() {
    try {
        const { data, error } = await supabaseAdmin
            .from('email_templates')
            .select('*')
            .eq('is_active', true)
            .order('category')
            .order('name');
        if (error)
            throw error;
        return data || [];
    }
    catch (err) {
        console.error('[TemplateService] Error fetching all templates:', err);
        return [];
    }
}
//# sourceMappingURL=template-service.js.map