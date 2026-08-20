export function visibilityFilter(viewerId) {
    return {
        $or: [{ visibility: "cohort" }, { owner: viewerId },],
    };
}

export function scoped(viewerId, filter = {}) {
    const vis = visibilityFilter(viewerId);
    if (Object.keys(filter).length === 0) return vis;
    return { $and: [vis, filter] };
}
