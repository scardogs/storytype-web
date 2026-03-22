export function isProUser(user) {
  return user?.plan === "pro" && user?.proStatus === "active";
}

export function buildUserPayload(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    stats: user.stats,
    plan: user.plan || "free",
    proStatus: user.proStatus || "inactive",
    proGrantedAt: user.proGrantedAt || null,
    proSource: user.proSource || "",
    isPro: isProUser(user),
  };
}
