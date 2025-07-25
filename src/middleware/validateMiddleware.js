export const validate = schema => (req, res, next) => {
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    const formattedErrors = result.error.errors.map(err => ({
      field: err.path.join('.') || 'root',
      message: err.message,
      code: err.code
    }));
    
    return res.status(400).json({
      error: "Error de validación",
      details: formattedErrors
    });
  }
  
  req.body = result.data;
  next();
};