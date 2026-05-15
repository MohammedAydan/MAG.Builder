import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'admin', 'editor');
  CREATE TYPE "public"."enum_sites_status" AS ENUM('active', 'suspended');
  CREATE TYPE "public"."enum_installation_state_status" AS ENUM('installed');
  CREATE TYPE "public"."enum_audit_logs_actor_role" AS ENUM('super-admin', 'admin', 'editor');
  CREATE TYPE "public"."enum_audit_logs_actor_source" AS ENUM('system', 'user', 'anonymous');
  CREATE TYPE "public"."enum_audit_logs_result" AS ENUM('success', 'failure');
  CREATE TYPE "public"."enum_plugin_states_migrations_status" AS ENUM('pending', 'applied');
  CREATE TYPE "public"."enum_commerce_customers_provider" AS ENUM('medusa');
  CREATE TYPE "public"."enum_commerce_orders_provider" AS ENUM('medusa');
  CREATE TYPE "public"."enum_commerce_orders_status" AS ENUM('draft', 'open', 'placed', 'fulfilled');
  CREATE TYPE "public"."enum_commerce_orders_payment_mode" AS ENUM('test');
  CREATE TYPE "public"."enum_forms_fields_type" AS ENUM('text', 'textarea', 'email', 'checkbox', 'select', 'hidden');
  CREATE TYPE "public"."enum_forms_actions_type" AS ENUM('email', 'webhook');
  CREATE TYPE "public"."enum_form_submissions_status" AS ENUM('received', 'processed', 'failed');
  CREATE TYPE "public"."enum_pages_access_level" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_access_level" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_access_level" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_access_level" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_webhook_subscriptions_events" AS ENUM('form.submitted', 'order.created', 'order.updated', 'page.published', 'page.unpublished');
  CREATE TYPE "public"."enum_webhook_deliveries_status" AS ENUM('success', 'failed');
  CREATE TYPE "public"."enum_integrations_provider" AS ENUM('medusa', 'stripe');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "members_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_id" integer,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "sites_domains" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hostname" varchar NOT NULL,
  	"primary" boolean DEFAULT false,
  	"development_only" boolean DEFAULT false
  );
  
  CREATE TABLE "sites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_id" varchar DEFAULT 'default' NOT NULL,
  	"slug" varchar DEFAULT 'default' NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_sites_status" DEFAULT 'active' NOT NULL,
  	"is_default" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "installation_state" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar DEFAULT 'primary' NOT NULL,
  	"status" "enum_installation_state_status" DEFAULT 'installed' NOT NULL,
  	"site_name" varchar NOT NULL,
  	"admin_email" varchar NOT NULL,
  	"installed_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" varchar NOT NULL,
  	"actor_user_id" integer,
  	"actor_email" varchar,
  	"actor_role" "enum_audit_logs_actor_role",
  	"actor_source" "enum_audit_logs_actor_source" DEFAULT 'system' NOT NULL,
  	"target_collection" varchar,
  	"target_id" varchar,
  	"result" "enum_audit_logs_result" NOT NULL,
  	"metadata" jsonb,
  	"occurred_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "plugin_states_enabled_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"module_id" varchar NOT NULL
  );
  
  CREATE TABLE "plugin_states_migrations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"migration_id" varchar NOT NULL,
  	"version" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"destructive" boolean DEFAULT false NOT NULL,
  	"status" "enum_plugin_states_migrations_status" DEFAULT 'pending' NOT NULL,
  	"executed_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "plugin_states" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"plugin_id" varchar NOT NULL,
  	"plugin_version" varchar NOT NULL,
  	"enabled" boolean DEFAULT false NOT NULL,
  	"activated_at" timestamp(3) with time zone,
  	"activated_by_id" integer,
  	"deactivated_at" timestamp(3) with time zone,
  	"deactivated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "commerce_customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_id" integer,
  	"provider" "enum_commerce_customers_provider" DEFAULT 'medusa' NOT NULL,
  	"member_id" integer NOT NULL,
  	"email" varchar NOT NULL,
  	"external_customer_id" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "commerce_orders_line_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_external_id" varchar NOT NULL,
  	"variant_external_id" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"quantity" numeric NOT NULL,
  	"unit_amount" numeric NOT NULL,
  	"total_amount" numeric NOT NULL,
  	"currency_code" varchar NOT NULL
  );
  
  CREATE TABLE "commerce_orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_id" integer,
  	"provider" "enum_commerce_orders_provider" DEFAULT 'medusa' NOT NULL,
  	"external_order_id" varchar NOT NULL,
  	"external_cart_id" varchar,
  	"member_id" integer,
  	"customer_email" varchar NOT NULL,
  	"external_customer_id" varchar,
  	"status" "enum_commerce_orders_status" DEFAULT 'placed' NOT NULL,
  	"currency_code" varchar NOT NULL,
  	"subtotal_amount" numeric NOT NULL,
  	"total_amount" numeric NOT NULL,
  	"payment_mode" "enum_commerce_orders_payment_mode" DEFAULT 'test' NOT NULL,
  	"placed_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "forms_fields_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "forms_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_forms_fields_type" NOT NULL,
  	"label" varchar NOT NULL,
  	"placeholder" varchar,
  	"required" boolean DEFAULT false,
  	"default_value" varchar
  );
  
  CREATE TABLE "forms_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_forms_actions_type" NOT NULL,
  	"webhook_url" varchar,
  	"email_to" varchar,
  	"email_to_name" varchar
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"site_id" integer,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_slug" varchar NOT NULL,
  	"fields" jsonb,
  	"submitted_at" timestamp(3) with time zone NOT NULL,
  	"status" "enum_form_submissions_status" DEFAULT 'received' NOT NULL,
  	"workflow_results" jsonb,
  	"site_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"excerpt" varchar,
  	"hero_image_id" integer,
  	"site_id" integer,
  	"access_level" "enum_pages_access_level" DEFAULT 'public',
  	"body" varchar,
  	"builder" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_no_follow" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_excerpt" varchar,
  	"version_hero_image_id" integer,
  	"version_site_id" integer,
  	"version_access_level" "enum__pages_v_version_access_level" DEFAULT 'public',
  	"version_body" varchar,
  	"version_builder" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_seo_no_follow" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"excerpt" varchar,
  	"featured_image_id" integer,
  	"site_id" integer,
  	"access_level" "enum_posts_access_level" DEFAULT 'public',
  	"body" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_no_follow" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_excerpt" varchar,
  	"version_featured_image_id" integer,
  	"version_site_id" integer,
  	"version_access_level" "enum__posts_v_version_access_level" DEFAULT 'public',
  	"version_body" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_seo_no_follow" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_path" varchar NOT NULL,
  	"destination_path" varchar NOT NULL,
  	"type" "enum_redirects_type" DEFAULT '301' NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"site_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "webhook_subscriptions_events" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_webhook_subscriptions_events",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "webhook_subscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"secret" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "webhook_deliveries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"subscription_id" integer NOT NULL,
  	"event" varchar NOT NULL,
  	"payload" jsonb NOT NULL,
  	"status" "enum_webhook_deliveries_status" NOT NULL,
  	"status_code" numeric,
  	"response_body" varchar,
  	"error_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "integrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"provider" "enum_integrations_provider" NOT NULL,
  	"active" boolean DEFAULT true,
  	"config" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"members_id" integer,
  	"sites_id" integer,
  	"installation_state_id" integer,
  	"audit_logs_id" integer,
  	"plugin_states_id" integer,
  	"commerce_customers_id" integer,
  	"commerce_orders_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"media_id" integer,
  	"pages_id" integer,
  	"posts_id" integer,
  	"redirects_id" integer,
  	"webhook_subscriptions_id" integer,
  	"webhook_deliveries_id" integer,
  	"integrations_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"members_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members" ADD CONSTRAINT "members_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites_domains" ADD CONSTRAINT "sites_domains_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "plugin_states_enabled_modules" ADD CONSTRAINT "plugin_states_enabled_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plugin_states"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "plugin_states_migrations" ADD CONSTRAINT "plugin_states_migrations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plugin_states"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "plugin_states" ADD CONSTRAINT "plugin_states_activated_by_id_users_id_fk" FOREIGN KEY ("activated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "plugin_states" ADD CONSTRAINT "plugin_states_deactivated_by_id_users_id_fk" FOREIGN KEY ("deactivated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "commerce_customers" ADD CONSTRAINT "commerce_customers_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "commerce_customers" ADD CONSTRAINT "commerce_customers_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "commerce_orders_line_items" ADD CONSTRAINT "commerce_orders_line_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."commerce_orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "commerce_orders" ADD CONSTRAINT "commerce_orders_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "commerce_orders" ADD CONSTRAINT "commerce_orders_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "forms_fields_options" ADD CONSTRAINT "forms_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_fields" ADD CONSTRAINT "forms_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_actions" ADD CONSTRAINT "forms_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms" ADD CONSTRAINT "forms_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects" ADD CONSTRAINT "redirects_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "webhook_subscriptions_events" ADD CONSTRAINT "webhook_subscriptions_events_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."webhook_subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_subscription_id_webhook_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."webhook_subscriptions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_installation_state_fk" FOREIGN KEY ("installation_state_id") REFERENCES "public"."installation_state"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_plugin_states_fk" FOREIGN KEY ("plugin_states_id") REFERENCES "public"."plugin_states"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_commerce_customers_fk" FOREIGN KEY ("commerce_customers_id") REFERENCES "public"."commerce_customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_commerce_orders_fk" FOREIGN KEY ("commerce_orders_id") REFERENCES "public"."commerce_orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_webhook_subscriptions_fk" FOREIGN KEY ("webhook_subscriptions_id") REFERENCES "public"."webhook_subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_webhook_deliveries_fk" FOREIGN KEY ("webhook_deliveries_id") REFERENCES "public"."webhook_deliveries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_integrations_fk" FOREIGN KEY ("integrations_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "members_sessions_order_idx" ON "members_sessions" USING btree ("_order");
  CREATE INDEX "members_sessions_parent_id_idx" ON "members_sessions" USING btree ("_parent_id");
  CREATE INDEX "members_site_idx" ON "members" USING btree ("site_id");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  CREATE INDEX "sites_domains_order_idx" ON "sites_domains" USING btree ("_order");
  CREATE INDEX "sites_domains_parent_id_idx" ON "sites_domains" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sites_site_id_idx" ON "sites" USING btree ("site_id");
  CREATE UNIQUE INDEX "sites_slug_idx" ON "sites" USING btree ("slug");
  CREATE INDEX "sites_updated_at_idx" ON "sites" USING btree ("updated_at");
  CREATE INDEX "sites_created_at_idx" ON "sites" USING btree ("created_at");
  CREATE UNIQUE INDEX "installation_state_key_idx" ON "installation_state" USING btree ("key");
  CREATE INDEX "installation_state_updated_at_idx" ON "installation_state" USING btree ("updated_at");
  CREATE INDEX "installation_state_created_at_idx" ON "installation_state" USING btree ("created_at");
  CREATE INDEX "audit_logs_actor_user_idx" ON "audit_logs" USING btree ("actor_user_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE INDEX "plugin_states_enabled_modules_order_idx" ON "plugin_states_enabled_modules" USING btree ("_order");
  CREATE INDEX "plugin_states_enabled_modules_parent_id_idx" ON "plugin_states_enabled_modules" USING btree ("_parent_id");
  CREATE INDEX "plugin_states_migrations_order_idx" ON "plugin_states_migrations" USING btree ("_order");
  CREATE INDEX "plugin_states_migrations_parent_id_idx" ON "plugin_states_migrations" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "plugin_states_plugin_id_idx" ON "plugin_states" USING btree ("plugin_id");
  CREATE INDEX "plugin_states_activated_by_idx" ON "plugin_states" USING btree ("activated_by_id");
  CREATE INDEX "plugin_states_deactivated_by_idx" ON "plugin_states" USING btree ("deactivated_by_id");
  CREATE INDEX "plugin_states_updated_at_idx" ON "plugin_states" USING btree ("updated_at");
  CREATE INDEX "plugin_states_created_at_idx" ON "plugin_states" USING btree ("created_at");
  CREATE INDEX "commerce_customers_site_idx" ON "commerce_customers" USING btree ("site_id");
  CREATE UNIQUE INDEX "commerce_customers_member_idx" ON "commerce_customers" USING btree ("member_id");
  CREATE UNIQUE INDEX "commerce_customers_external_customer_id_idx" ON "commerce_customers" USING btree ("external_customer_id");
  CREATE INDEX "commerce_customers_updated_at_idx" ON "commerce_customers" USING btree ("updated_at");
  CREATE INDEX "commerce_customers_created_at_idx" ON "commerce_customers" USING btree ("created_at");
  CREATE INDEX "commerce_orders_line_items_order_idx" ON "commerce_orders_line_items" USING btree ("_order");
  CREATE INDEX "commerce_orders_line_items_parent_id_idx" ON "commerce_orders_line_items" USING btree ("_parent_id");
  CREATE INDEX "commerce_orders_site_idx" ON "commerce_orders" USING btree ("site_id");
  CREATE UNIQUE INDEX "commerce_orders_external_order_id_idx" ON "commerce_orders" USING btree ("external_order_id");
  CREATE INDEX "commerce_orders_member_idx" ON "commerce_orders" USING btree ("member_id");
  CREATE INDEX "commerce_orders_updated_at_idx" ON "commerce_orders" USING btree ("updated_at");
  CREATE INDEX "commerce_orders_created_at_idx" ON "commerce_orders" USING btree ("created_at");
  CREATE INDEX "forms_fields_options_order_idx" ON "forms_fields_options" USING btree ("_order");
  CREATE INDEX "forms_fields_options_parent_id_idx" ON "forms_fields_options" USING btree ("_parent_id");
  CREATE INDEX "forms_fields_order_idx" ON "forms_fields" USING btree ("_order");
  CREATE INDEX "forms_fields_parent_id_idx" ON "forms_fields" USING btree ("_parent_id");
  CREATE INDEX "forms_actions_order_idx" ON "forms_actions" USING btree ("_order");
  CREATE INDEX "forms_actions_parent_id_idx" ON "forms_actions" USING btree ("_parent_id");
  CREATE INDEX "forms_slug_idx" ON "forms" USING btree ("slug");
  CREATE INDEX "forms_site_idx" ON "forms" USING btree ("site_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE INDEX "form_submissions_form_slug_idx" ON "form_submissions" USING btree ("form_slug");
  CREATE INDEX "form_submissions_site_idx" ON "form_submissions" USING btree ("site_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_hero_image_idx" ON "pages" USING btree ("hero_image_id");
  CREATE INDEX "pages_site_idx" ON "pages" USING btree ("site_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_hero_image_idx" ON "_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_version_site_idx" ON "_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE INDEX "posts_site_idx" ON "posts" USING btree ("site_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_featured_image_idx" ON "_posts_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_posts_v_version_version_site_idx" ON "_posts_v" USING btree ("version_site_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "redirects_site_idx" ON "redirects" USING btree ("site_id");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "webhook_subscriptions_events_order_idx" ON "webhook_subscriptions_events" USING btree ("order");
  CREATE INDEX "webhook_subscriptions_events_parent_idx" ON "webhook_subscriptions_events" USING btree ("parent_id");
  CREATE INDEX "webhook_subscriptions_updated_at_idx" ON "webhook_subscriptions" USING btree ("updated_at");
  CREATE INDEX "webhook_subscriptions_created_at_idx" ON "webhook_subscriptions" USING btree ("created_at");
  CREATE INDEX "webhook_deliveries_subscription_idx" ON "webhook_deliveries" USING btree ("subscription_id");
  CREATE INDEX "webhook_deliveries_updated_at_idx" ON "webhook_deliveries" USING btree ("updated_at");
  CREATE INDEX "webhook_deliveries_created_at_idx" ON "webhook_deliveries" USING btree ("created_at");
  CREATE UNIQUE INDEX "integrations_name_idx" ON "integrations" USING btree ("name");
  CREATE INDEX "integrations_updated_at_idx" ON "integrations" USING btree ("updated_at");
  CREATE INDEX "integrations_created_at_idx" ON "integrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_locked_documents_rels_sites_id_idx" ON "payload_locked_documents_rels" USING btree ("sites_id");
  CREATE INDEX "payload_locked_documents_rels_installation_state_id_idx" ON "payload_locked_documents_rels" USING btree ("installation_state_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_locked_documents_rels_plugin_states_id_idx" ON "payload_locked_documents_rels" USING btree ("plugin_states_id");
  CREATE INDEX "payload_locked_documents_rels_commerce_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("commerce_customers_id");
  CREATE INDEX "payload_locked_documents_rels_commerce_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("commerce_orders_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_webhook_subscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("webhook_subscriptions_id");
  CREATE INDEX "payload_locked_documents_rels_webhook_deliveries_id_idx" ON "payload_locked_documents_rels" USING btree ("webhook_deliveries_id");
  CREATE INDEX "payload_locked_documents_rels_integrations_id_idx" ON "payload_locked_documents_rels" USING btree ("integrations_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_members_id_idx" ON "payload_preferences_rels" USING btree ("members_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "members_sessions" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "sites_domains" CASCADE;
  DROP TABLE "sites" CASCADE;
  DROP TABLE "installation_state" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "plugin_states_enabled_modules" CASCADE;
  DROP TABLE "plugin_states_migrations" CASCADE;
  DROP TABLE "plugin_states" CASCADE;
  DROP TABLE "commerce_customers" CASCADE;
  DROP TABLE "commerce_orders_line_items" CASCADE;
  DROP TABLE "commerce_orders" CASCADE;
  DROP TABLE "forms_fields_options" CASCADE;
  DROP TABLE "forms_fields" CASCADE;
  DROP TABLE "forms_actions" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "webhook_subscriptions_events" CASCADE;
  DROP TABLE "webhook_subscriptions" CASCADE;
  DROP TABLE "webhook_deliveries" CASCADE;
  DROP TABLE "integrations" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_sites_status";
  DROP TYPE "public"."enum_installation_state_status";
  DROP TYPE "public"."enum_audit_logs_actor_role";
  DROP TYPE "public"."enum_audit_logs_actor_source";
  DROP TYPE "public"."enum_audit_logs_result";
  DROP TYPE "public"."enum_plugin_states_migrations_status";
  DROP TYPE "public"."enum_commerce_customers_provider";
  DROP TYPE "public"."enum_commerce_orders_provider";
  DROP TYPE "public"."enum_commerce_orders_status";
  DROP TYPE "public"."enum_commerce_orders_payment_mode";
  DROP TYPE "public"."enum_forms_fields_type";
  DROP TYPE "public"."enum_forms_actions_type";
  DROP TYPE "public"."enum_form_submissions_status";
  DROP TYPE "public"."enum_pages_access_level";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_access_level";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_access_level";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_access_level";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_webhook_subscriptions_events";
  DROP TYPE "public"."enum_webhook_deliveries_status";
  DROP TYPE "public"."enum_integrations_provider";`)
}
