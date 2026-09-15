/** Phase entry — v1 uses date/date_format shortcuts; v2 uses start/end date fields. */
export type ProductLifeCyclePhase = {
  name: string;
  date?: string;
  date_format?: string;
  start_date?: string;
  end_date?: string;
  start_date_format?: string;
  end_date_format?: string;
  superscript?: string;
  additional_text?: string;
};

export type ProductLifeCycle = {
  name: string;
  versions: {
    name: string;
    type: string;
    last_minor_release?: string | null;
    final_minor_release?: string | null;
    extra_header_value?: string | null;
    phases?: ProductLifeCyclePhase[];
    extra_dependences?: string[];
    additional_text?: string;
    tier?: string;
    openshift_compatibility?: string | null;
  }[];
  uuid?: string;
  former_names?: string[];
  /** v1 only */
  show_last_minor_release?: boolean;
  /** v2 replacement for show_last_minor_release */
  opl_uuid?: string | null;
  show_final_minor_release?: boolean;
  is_layered_product: boolean;
  all_phases: {
    name: string;
    ptype?: string;
    tooltip?: string;
    display_name: string;
    additional_text?: string;
  }[];
  link: string;
  policies?: string;
  release_cadence?: string;
};

export type ProductLifeCycles = {
  data: ProductLifeCycle[];
};
