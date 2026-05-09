---
layout: page
permalink: /publications/
title: publications
description:
nav: true
nav_order: 3
---

<!-- _pages/publications.md -->

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications">

Journals

{% bibliography --group_by none --query @*[category=journal]* %}

Conferences

{% bibliography --group_by none --query @*[category=conference]* %}

</div>
