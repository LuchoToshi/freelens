/**
 * The site's one measure.
 *
 * Every page frame is 1024px wide with a 20/32px gutter, so the wordmark in the
 * header, the heading under it and the footer all sit on the same vertical
 * line. Before this there were four frames and two gutters in play (672 on
 * /tool, 768 on three homepage sections, 1024 on /tarief and the chrome, 1152
 * on the rest of the homepage), so the left edge moved on almost every scroll.
 *
 * A class string rather than a wrapper component, so applying it is a one-line
 * change at each of the fifteen call sites and no closing tags move.
 *
 * Sections that want a narrower reading measure constrain their own content
 * inside this frame, left-aligned, rather than declaring a narrower frame of
 * their own. That is the rule that keeps the edge from drifting again.
 */
export const container = "mx-auto w-full max-w-5xl px-5 sm:px-8";

/** Comfortable line length for running text sitting inside `container`. */
export const readingMeasure = "max-w-2xl";
