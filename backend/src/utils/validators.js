function limparCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

// Validacao de CPF com digitos verificadores (algoritmo padrao)
function isCpfValido(cpfBruto) {
  const cpf = limparCpf(cpfBruto);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i += 1) soma += Number(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) soma += Number(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpf[10])) return false;

  return true;
}

// Formato esperado: YYYY-MM-DD
function isDataValida(data) {
  if (!data) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(data) && !Number.isNaN(Date.parse(data));
}

// Minimo 6 caracteres, pelo menos 1 letra e 1 numero
function isSenhaForte(senha) {
  if (!senha || senha.length < 6) return false;
  return /[A-Za-z]/.test(senha) && /\d/.test(senha);
}

module.exports = { limparCpf, isCpfValido, isDataValida, isSenhaForte };
