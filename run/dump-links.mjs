#!/usr/bin/env node

import { getAllExternalLinks } from '../src/common/urlUtils.mjs';

const allUrls = await getAllExternalLinks();
allUrls.forEach((url) => console.log(url));
