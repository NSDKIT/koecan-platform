export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      monitor_profiles: {
        Row: {
          user_id: string;
          name: string;
          email: string;
          university: string | null;
          occupation: string;
          age: number | null;
          gender: string | null;
          location: string | null;
          points: number;
          referral_code: string;
          referral_count: number;
          referral_points: number;
          is_line_linked: boolean;
          push_opt_in: boolean;
          tags: string[];
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['monitor_profiles']['Row']> & {
          user_id: string;
          name: string;
          email: string;
          occupation: string;
        };
        Update: Partial<Database['public']['Tables']['monitor_profiles']['Row']>;
        Relationships: [];
      };
      surveys: {
        Row: {
          id: string;
          title: string;
          category: string;
          reward_points: number;
          questions: number;
          status: string;
          deadline: string;
          delivery_channels: string[];
          target_tags: string[];
          ai_matching_score: number;
        };
        Insert: Partial<Database['public']['Tables']['surveys']['Row']> & { id: string; title: string };
        Update: Partial<Database['public']['Tables']['surveys']['Row']>;
        Relationships: [];
      };
      point_transactions: {
        Row: {
          id: string;
          user_id: string;
          happened_at: string;
          amount: number;
          reason: string;
          description: string;
        };
        Insert: Partial<Database['public']['Tables']['point_transactions']['Row']> & {
          id: string;
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['point_transactions']['Row']>;
        Relationships: [];
      };
      reward_items: {
        Row: {
          id: string;
          name: string;
          provider: string;
          points_required: number;
          delivery: string;
        };
        Insert: Database['public']['Tables']['reward_items']['Row'];
        Update: Partial<Database['public']['Tables']['reward_items']['Row']>;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          category: string;
          published_at: string;
          audience: string[];
        };
        Insert: Partial<Database['public']['Tables']['announcements']['Row']> & { title: string; body: string };
        Update: Partial<Database['public']['Tables']['announcements']['Row']>;
        Relationships: [];
      };
      faq_items: {
        Row: {
          id: string;
          question: string;
          answer: string;
          category: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['faq_items']['Row']> & { question: string; answer: string };
        Update: Partial<Database['public']['Tables']['faq_items']['Row']>;
        Relationships: [];
      };
      referral_statuses: {
        Row: {
          code: string;
          total_referrals: number;
          successful_referrals: number;
          pending_referrals: number;
          reward_points: number;
          last_updated: string;
          user_id: string;
        };
        Insert: Database['public']['Tables']['referral_statuses']['Row'];
        Update: Partial<Database['public']['Tables']['referral_statuses']['Row']>;
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          subject: string;
          channel: string;
          priority: string;
          status: string;
          created_at: string;
        };
        Insert: Database['public']['Tables']['support_tickets']['Row'];
        Update: Partial<Database['public']['Tables']['support_tickets']['Row']>;
        Relationships: [];
      };
      career_slots: {
        Row: {
          id: string;
          mentor: string;
          topic: string;
          starts_at: string;
          mode: string;
          available_seats: number;
        };
        Insert: Database['public']['Tables']['career_slots']['Row'];
        Update: Partial<Database['public']['Tables']['career_slots']['Row']>;
        Relationships: [];
      };
      policy_documents: {
        Row: {
          id: string;
          title: string;
          version: string;
          updated_at: string;
          url: string;
        };
        Insert: Database['public']['Tables']['policy_documents']['Row'];
        Update: Partial<Database['public']['Tables']['policy_documents']['Row']>;
        Relationships: [];
      };
      notification_templates: {
        Row: {
          id: string;
          channel: string;
          title: string;
          body: string;
          cta: string | null;
        };
        Insert: Database['public']['Tables']['notification_templates']['Row'];
        Update: Partial<Database['public']['Tables']['notification_templates']['Row']>;
        Relationships: [];
      };
      data_import_jobs: {
        Row: {
          id: string;
          type: string;
          entity: string;
          status: string;
          submitted_by: string;
          submitted_at: string;
        };
        Insert: Database['public']['Tables']['data_import_jobs']['Row'];
        Update: Partial<Database['public']['Tables']['data_import_jobs']['Row']>;
        Relationships: [];
      };
      exchange_requests: {
        Row: {
          id: string;
          user_name: string;
          reward_name: string;
          points_used: number;
          provider: string;
          status: string;
          requested_at: string;
        };
        Insert: Database['public']['Tables']['exchange_requests']['Row'];
        Update: Partial<Database['public']['Tables']['exchange_requests']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
