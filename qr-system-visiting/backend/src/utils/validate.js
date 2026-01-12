const MAX_COMMENT_LENGTH = 1000;
const MAX_EMAIL_LENGTH = 320;

export const isValidRating = (value) => Number.isInteger(value) && value >= 1 && value <= 5;

export const isValidEmail = (email) => {
  if (!email) return true;
  if (email.length > MAX_EMAIL_LENGTH) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidComment = (comment) => {
  if (!comment) return true;
  return comment.length <= MAX_COMMENT_LENGTH;
};

export const sanitizeString = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

export const validateFeedbackPayload = ({ rating, comment, email }) => {
  const errors = [];

  if (!isValidRating(rating)) {
    errors.push('rating must be an integer between 1 and 5');
  }

  if (!isValidComment(comment)) {
    errors.push(`comment must be ${MAX_COMMENT_LENGTH} characters or less`);
  }
  if (!isValidEmail(email)) {
    errors.push('email is invalid');
  }

  return errors;
};
