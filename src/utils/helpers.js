// Utility functions for common operations

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateScore = (answers, questions) => {
  let correct = 0;
  questions.forEach(question => {
    if (answers[question.id] === question.correctAnswer) {
      correct++;
    }
  });
  return {
    correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100)
  };
};

export const getGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', message: 'Outstanding!' };
  if (percentage >= 80) return { grade: 'A', color: 'text-green-600', message: 'Excellent!' };
  if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600', message: 'Good job!' };
  if (percentage >= 60) return { grade: 'B', color: 'text-blue-600', message: 'Well done!' };
  if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600', message: 'Keep learning!' };
  return { grade: 'D', color: 'text-red-600', message: 'Need improvement!' };
};

export const generateRegistrationId = () => {
  return `REG-${Date.now().toString().slice(-6)}`;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/\s+/g, ''));
};

export const exportToCSV = (data, filename) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const getTimeRemaining = (endTime) => {
  const now = new Date().getTime();
  const distance = endTime - now;
  
  if (distance < 0) return { expired: true };
  
  return {
    expired: false,
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000)
  };
};
