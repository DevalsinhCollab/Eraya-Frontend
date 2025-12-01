


export const apisHeaders = {
  headers: { "Content-Type": "application/json" },
};

export const ApiHeaderWithToken = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,   // <-- required
    },
  };
};