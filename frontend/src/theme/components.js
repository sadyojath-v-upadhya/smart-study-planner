const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: "#F8FAFC",
      },
    },
  },

  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 12,
        textTransform: "none",
        fontWeight: 600,
        minHeight: 48,
        paddingInline: 24,
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: "0px 4px 12px rgba(15, 23, 42, 0.08)",
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
    },
  },

  MuiTextField: {
    defaultProps: {
      variant: "outlined",
      fullWidth: true,
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        minHeight: 48,
      },
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
      },
    },
  }
};

export default components;