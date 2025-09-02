import { architectures, channels, operatingSystems, tools, urls } from '~/common/installLinks.mjs';

import {
  allArchitecturesForTool,
  allOperatingSystemsForTool,
  initialSelection,
} from '../downloadUtils';

const { linux, mac, windows, rhel9_fips: rhel9Fips, rhel9, rhel8 } = operatingSystems;
const { arm, ppc, s390x, x86 } = architectures;

describe('allArchitecturesForTool', () => {
  it('includes arm for odo', () => {
    const values = allArchitecturesForTool(urls, tools.ODO, channels.STABLE).map((o) => o.value);
    expect(values).toEqual([x86, arm, ppc, s390x]);
  });

  it('has only x86 for rosa', () => {
    const values = allArchitecturesForTool(urls, tools.ROSA, channels.STABLE).map((o) => o.value);
    expect(values).toEqual([x86]);
  });
});

// These tests depend on installLinks.mjs data.
describe('allOperatingSystemsForTool', () => {
  it('excludes Windows for installer', () => {
    const values = allOperatingSystemsForTool(urls, tools.X86INSTALLER, channels.STABLE).map(
      (o) => o.value,
    );
    expect(values).toEqual([linux, rhel9Fips, mac]);
  });

  it('includes all OSes for oc', () => {
    const values = allOperatingSystemsForTool(urls, tools.OC, channels.STABLE).map((o) => o.value);
    expect(values).toEqual([linux, rhel9, rhel8, mac, windows]);
  });

  it('includes all OSes for opm', () => {
    const values = allOperatingSystemsForTool(urls, tools.OPM, channels.STABLE).map((o) => o.value);
    expect(values).toEqual([linux, rhel9, rhel8, mac, windows]);
  });
});

describe('initialSelection', () => {
  it('when detection fails, chooses Linux, x86', () => {
    // If user has some exotic browser/OS, it's more convenient to select _something_
    // so all Download buttons work, than force user to choose in all rows.
    const initial = initialSelection(urls, tools.OC, channels.STABLE, null);
    expect(initial).toEqual({ OS: linux, architecture: architectures.x86 });
  });

  it('on Linux, chooses x86', () => {
    const initial = initialSelection(urls, tools.OC, channels.STABLE, linux);
    expect(initial).toEqual({ OS: linux, architecture: architectures.x86 });
  });

  it('on Windows, chooses x86', () => {
    const initial = initialSelection(urls, tools.OC, channels.STABLE, windows);
    expect(initial).toEqual({ OS: windows, architecture: architectures.x86 });
  });

  it('when not available for detected OS, chooses first option Linux x86', () => {
    // The concrete use case is Windows user, installer is only available for Linux & Mac.
    // Plausible behaviors in that case:
    //  1. keep download disabled, force user to "Select OS".
    //     Benefit: user will not miss that this row needs a different OS from the rest.
    //  2. pre-select first OS - Linux.
    //     Benefit: user needs _something_ and Linux is more useful (WSL, free VMs).
    const initial = initialSelection(urls, tools.X86INSTALLER, channels.STABLE, windows);
    expect(initial).toEqual({ OS: linux, architecture: architectures.x86 });
  });
});
