import { ReactNode } from 'react';

export interface PuzzleDefinition {
  id: string;
  name: string;
  description: string;
  generator: (level: number) => { 
    question: string | ReactNode; 
    options?: string[]; 
    correctAnswer: string; 
    explanation: string; 
  };
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence<T>(len: number, fn: (i: number) => T): T[] {
  return Array.from({ length: len }, (_, i) => fn(i));
}

function isPrime(n: number) {
  if (n <= 1) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function getPrime(nth: number) {
  let count = 0;
  let i = 2;
  while (true) {
    if (isPrime(i)) count++;
    if (count === nth) return i;
    i++;
  }
}

const WORDS = ["APPLE", "BRAIN", "SMART", "HEURISTIC", "COGNITIVE", "LOGIC", "PUZZLE", "GENIUS", "SYNAPSE", "NEURON", "CORTEX", "MEMORY"];

export const IQ_PUZZLES: PuzzleDefinition[] = [
  {
    id: 'iq-anagram', name: 'Anagram Decoder', description: 'Unscramble the letters to find the word.',
    generator: (level) => {
      const word = WORDS[Math.min(level - 1, WORDS.length - 1)] || WORDS[randInt(0, WORDS.length - 1)];
      const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
      return { question: `Unscramble: ${scrambled}`, correctAnswer: word, explanation: `The letters make up the word ${word}` };
    }
  },
  {
    id: 'iq-vowel-count', name: 'Vowel Counter', description: 'Count the vowels quickly.',
    generator: (level) => {
      const len = 5 + level * 2;
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let str = '';
      let vowels = 0;
      for (let i = 0; i < len; i++) {
        const char = letters[randInt(0, 25)];
        str += char;
        if ('AEIOU'.includes(char)) vowels++;
      }
      return { question: `How many vowels in: ${str}?`, correctAnswer: String(vowels), explanation: `There are ${vowels} vowels (A, E, I, O, U).` };
    }
  },
  {
    id: 'iq-arithmetic-progression', name: 'Arithmetic Series', description: 'Find the next number in the pattern.',
    generator: (level) => {
      const step = randInt(2, level * 2 + 2);
      const start = randInt(1, 20);
      const seq = generateSequence(4, i => start + i * step);
      const next = start + 4 * step;
      return { question: `Next number: ${seq.join(', ')}, ?`, correctAnswer: String(next), explanation: `The step is +${step}` };
    }
  },
  {
    id: 'iq-geometric-progression', name: 'Geometric Series', description: 'Find the next number multiplying.',
    generator: (level) => {
      const mult = randInt(2, Math.min(level + 1, 5));
      const start = randInt(1, 5);
      const seq = generateSequence(4, i => start * Math.pow(mult, i));
      const next = start * Math.pow(mult, 4);
      return { question: `Next number: ${seq.join(', ')}, ?`, correctAnswer: String(next), explanation: `The multiplier is x${mult}` };
    }
  },
  {
    id: 'iq-squares', name: 'Square Sequence', description: 'Recognize the sequence of squares.',
    generator: (level) => {
      const start = randInt(1, level + 5);
      const seq = generateSequence(4, i => Math.pow(start + i, 2));
      const next = Math.pow(start + 4, 2);
      return { question: `Next number: ${seq.join(', ')}, ?`, correctAnswer: String(next), explanation: `These are consecutive squares, next is ${start + 4}^2 = ${next}` };
    }
  },
  {
    id: 'iq-primes', name: 'Prime Finder', description: 'Identify prime sequences.',
    generator: (level) => {
      const startNth = randInt(1, level + 3);
      const seq = generateSequence(4, i => getPrime(startNth + i));
      const next = getPrime(startNth + 4);
      return { question: `Next prime: ${seq.join(', ')}, ?`, correctAnswer: String(next), explanation: `Sequence of prime numbers, next is ${next}` };
    }
  },
  {
    id: 'iq-fibonacci', name: 'Fibonacci Variant', description: 'Add previous terms.',
    generator: (level) => {
      let a = randInt(1, level);
      let b = randInt(1, level + 2);
      const seq = [a, b];
      for (let i = 0; i < 3; i++) {
        const next = a + b;
        seq.push(next);
        a = b;
        b = next;
      }
      return { question: `Next sequence number: ${seq.slice(0, 4).join(', ')}, ?`, correctAnswer: String(seq[4]), explanation: `Each term is the sum of the previous two.` };
    }
  },
  {
    id: 'iq-caesar', name: 'Shift Cipher', description: 'Decode a shifted string (+1 letter).',
    generator: (level) => {
      const word = WORDS[Math.min(level - 1, WORDS.length - 1)] || WORDS[randInt(0, WORDS.length - 1)];
      const shift = 1;
      const cipher = word.split('').map(c => String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65)).join('');
      return { question: `Decode (Shift -1): ${cipher}`, correctAnswer: word, explanation: `Shift each letter backward by 1 in the alphabet.` };
    }
  },
  {
    id: 'iq-word-value', name: 'Alpha Numeric Value', description: 'A=1, B=2. What is the sum?',
    generator: (level) => {
      const words = ["SUN", "CAT", "DOG", "BAT", "ART", "PEN", "LOGIC", "SMART"];
      const word = words[Math.min(level - 1, words.length - 1)] || words[randInt(0, words.length - 1)];
      const sum = word.split('').reduce((acc, c) => acc + (c.charCodeAt(0) - 64), 0);
      return { question: `If A=1, B=2, C=3... sum for ${word}?`, correctAnswer: String(sum), explanation: `${word.split('').map(c => `${c}=${c.charCodeAt(0)-64}`).join(', ')} -> sum is ${sum}` };
    }
  },
  {
    id: 'iq-next-char', name: 'Letter Series', description: 'Find the next letter in the pattern.',
    generator: (level) => {
      const step = randInt(1, Math.min(3, level));
      const start = randInt(0, 10);
      const seq = generateSequence(4, i => String.fromCharCode(65 + start + i * step));
      const next = String.fromCharCode(65 + start + 4 * step);
      return { question: `Next letter: ${seq.join(', ')}, ?`, correctAnswer: next, explanation: `Step is +${step} letters.` };
    }
  },
  {
    id: 'iq-odd-out-even', name: 'Odd One Out (Parity)', description: 'Find the odd number out.',
    generator: (level) => {
      const isFindingOdd = Math.random() > 0.5; // looking for odd or even parity
      const nums = [];
      let answer = "";
      for (let i = 0; i < 3; i++) {
        let n = randInt(2, level * 10) * 2;
        if (isFindingOdd) n += 1;
        nums.push(n);
      }
      let target = randInt(2, level * 10) * 2;
      if (!isFindingOdd) target += 1; // It has different parity
      nums.push(target);
      nums.sort(() => Math.random() - 0.5);
      return { question: `Which number doesn't belong? ${nums.join(', ')}`, correctAnswer: String(target), explanation: `Parity differs (Odd/Even rule).` };
    }
  },
  {
    id: 'iq-digit-sum', name: 'Digit Summation', description: 'Sum the digits of the given number.',
    generator: (level) => {
      const num = randInt(Math.pow(10, level), Math.pow(10, level+1));
      const sum = String(num).split('').reduce((acc, d) => acc + parseInt(d), 0);
      return { question: `Sum of digits of ${num}?`, correctAnswer: String(sum), explanation: `Add all digits: sum is ${sum}.` };
    }
  },
  {
    id: 'iq-digital-root', name: 'Digital Root', description: 'Sum digits repeatedly until single digit.',
    generator: (level) => {
      const num = randInt(Math.pow(10, level+1), Math.pow(10, level+2));
      let root = String(num).split('').reduce((acc, d) => acc + parseInt(d), 0);
      while (root >= 10) {
         root = String(root).split('').reduce((acc, d) => acc + parseInt(d), 0);
      }
      return { question: `Digital root of ${num}?`, correctAnswer: String(root), explanation: `Sum digits until you get a single digit: ${root}.` };
    }
  },
  {
    id: 'iq-modulo', name: 'Clock Arithmetic (Modulo)', description: 'What is X modulo Y?',
    generator: (level) => {
      const divisor = randInt(2, level + 5);
      const n = randInt(divisor * 2, divisor * 10 + level);
      const mod = n % divisor;
      return { question: `What is ${n} mod ${divisor}? (Remainder)`, correctAnswer: String(mod), explanation: `${n} divided by ${divisor} leaves remainder ${mod}.` };
    }
  },
  {
    id: 'iq-binary-to-dec', name: 'Binary to Decimal', description: 'Convert binary to regular number.',
    generator: (level) => {
      const dec = randInt(2, Math.min((level + 1) * 4, 255));
      const bin = dec.toString(2);
      return { question: `Convert binary ${bin} to decimal:`, correctAnswer: String(dec), explanation: `Binary ${bin} = Decimal ${dec}.` };
    }
  },
  {
    id: 'iq-dec-to-binary', name: 'Decimal to Binary', description: 'Convert decimal to binary number.',
    generator: (level) => {
      const dec = randInt(2, Math.min((level + 1) * 3, 63));
      return { question: `Convert decimal ${dec} to binary:`, correctAnswer: dec.toString(2), explanation: `Decimal ${dec} = Binary ${dec.toString(2)}.` };
    }
  },
  {
    id: 'iq-hex-to-dec', name: 'Hex to Decimal', description: 'Convert hexadecimal to regular number.',
    generator: (level) => {
      const dec = randInt(10, Math.min((level + 1) * 5, 255));
      const hex = dec.toString(16).toUpperCase();
      return { question: `Convert hex ${hex} to decimal:`, correctAnswer: String(dec), explanation: `Hex ${hex} = Decimal ${dec}.` };
    }
  },
  {
    id: 'iq-cubes', name: 'Cube Sequence', description: 'Identify the next cubic number.',
    generator: (level) => {
      const start = randInt(1, Math.min(level, 5));
      const seq = generateSequence(3, i => Math.pow(start + i, 3));
      const next = Math.pow(start + 3, 3);
      return { question: `Next number: ${seq.join(', ')}, ?`, correctAnswer: String(next), explanation: `These are consecutive cubes, next is ${start + 3}^3 = ${next}` };
    }
  },
  {
    id: 'iq-divisibility-3', name: 'Rule of 3', description: 'Is the number divisible by 3?',
    generator: (level) => {
      const isDiv = Math.random() > 0.5;
      let num = randInt(100, Math.pow(10, Math.min(level + 1, 8)));
      while ((num % 3 === 0) !== isDiv) num++;
      return { question: `Is ${num} divisible by 3? (Yes/No)`, correctAnswer: isDiv ? 'Yes' : 'No', explanation: `Sum of digits is ${String(num).split('').reduce((a,b)=>a+parseInt(b),0)}, which ${isDiv ? 'is' : 'is not'} divisible by 3.` };
    }
  },
  {
    id: 'iq-leap-year', name: 'Leap Year', description: 'Identify if a year is a leap year.',
    generator: (level) => {
      const years = [1900, 2000, 2004, 2023, 2100, 2024, 2400];
      const year = years[randInt(0, years.length - 1)];
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      return { question: `Is ${year} a leap year? (Yes/No)`, correctAnswer: isLeap ? 'Yes' : 'No', explanation: `Divisible by 4 (and not 100 unless 400).` };
    }
  },
  {
    id: 'iq-clock-angle', name: 'Clock Angles', description: 'Rough angle between hands at specific hours.',
    generator: (level) => {
      const hour = randInt(1, 11);
      // Angle for 0 mins = hour * 30.
      const angle = Math.min((12 - hour) * 30, hour * 30);
      return { question: `At ${hour}:00, what is the smallest angle between hour and minute hands?`, correctAnswer: String(angle), explanation: `Each hour on a clock is 30 degrees.` };
    }
  },
  {
    id: 'iq-factorial', name: 'Factorials', description: 'Calculate the factorial N!',
    generator: (level) => {
      const n = randInt(3, Math.min(level + 2, 7));
      let fact = 1;
      for (let i = 2; i <= n; i++) fact *= i;
      return { question: `What is ${n}! ?`, correctAnswer: String(fact), explanation: `Product of all integers up to ${n} is ${fact}.` };
    }
  },
  {
    id: 'iq-dice-opposite', name: 'Dice Opposite', description: 'Standard 6-sided dice logic.',
    generator: (level) => {
      const face = randInt(1, 6);
      return { question: `On a standard D6 dice, what is opposite to ${face}?`, correctAnswer: String(7 - face), explanation: `Opposite faces always sum to 7.` };
    }
  },
  {
    id: 'iq-roman', name: 'Roman Numerals', description: 'Decode the Roman Numerals.',
    generator: (level) => {
      const romanMap = [
        { val: 10, str: 'X' }, { val: 5, str: 'V' },
        { val: 4, str: 'IV' }, { val: 1, str: 'I' }
      ];
      let num = randInt(1, Math.min(level * 5 + 5, 39));
      const original = num;
      let roman = '';
      for (let { val, str } of romanMap) {
        while (num >= val) {
          roman += str;
          num -= val;
        }
      }
      return { question: `Convert Roman ${roman} to integer:`, correctAnswer: String(original), explanation: `Standard Roman numeral conversion.` };
    }
  },
  {
    id: 'iq-pattern-word', name: 'Word Length Pattern', description: 'What comes next based on length?',
    generator: (level) => {
      const sentence = "I am the hero of world".split(' ');
      const sub = sentence.slice(0, 4);
      return { question: `Length pattern: ${sub.join(', ')}, ?`, correctAnswer: String(sentence[4].length), explanation: `Lengths are ${sub.map(s => s.length).join(', ')}, next is ${sentence[4].length}` };
    }
  },
  {
    id: 'iq-age', name: 'Age Problem', description: 'Simple linear equations.',
    generator: (level) => {
      const factor = randInt(2, 4);
      const diff = randInt(10, 30);
      const young = diff / (factor - 1);
      const old = young * factor;
      return { question: `A is ${factor} times B's age. A is ${diff} yrs older. What is A's age?`, correctAnswer: String(old), explanation: `A - B = ${diff}, A = ${factor}B. Solving gives A = ${old}.` };
    }
  },
  {
    id: 'iq-calendar-days', name: 'Calendar Logic', description: 'Advance days of the week.',
    generator: (level) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const add = randInt(10, level * 5 + 10);
      const start = randInt(0, 6);
      const end = (start + add) % 7;
      return { question: `If today is ${days[start]}, what is the day after ${add} days?`, correctAnswer: days[end], explanation: `${add} mod 7 is ${add%7}. ${days[start]} + ${add%7} days = ${days[end]}.` };
    }
  },
  {
    id: 'iq-missing-operator-string', name: 'Evaluate Expression', description: 'Evaluate carefully using BEDMAS/BODMAS.',
    generator: (level) => {
      const a = randInt(2, 10);
      const b = randInt(2, 5);
      const c = randInt(2, 5);
      const ans = a + b * c;
      return { question: `Evaluate: ${a} + ${b} * ${c} `, correctAnswer: String(ans), explanation: `Multiply first: ${b}*${c} = ${b*c}, then add ${a} = ${ans}.` };
    }
  },
  {
    id: 'iq-fraction-compare', name: 'Fraction Compare', description: 'Which is larger?',
    generator: (level) => {
      const n1 = randInt(1, 4), d1 = randInt(n1+1, 6);
      const n2 = randInt(1, 4), d2 = randInt(n2+1, 6);
      // to avoid equal
      if (n1/d1 === n2/d2) return { question: `Largest? 1/2 or 1/3`, correctAnswer: "1/2", explanation: "1/2 > 1/3" }; 
      const q = `Largest? ${n1}/${d1} or ${n2}/${d2}`;
      const ans = (n1/d1) > (n2/d2) ? `${n1}/${d1}` : `${n2}/${d2}`;
      return { question: q, correctAnswer: ans, explanation: `Compare decimal values.` };
    }
  },
  {
    id: 'iq-true-false', name: 'Boolean Logic', description: 'T AND F OR T?',
    generator: (level) => {
      const op1 = Math.random() > 0.5 ? 'AND' : 'OR';
      const b1 = Math.random() > 0.5;
      const b2 = Math.random() > 0.5;
      let ans = op1 === 'AND' ? b1 && b2 : b1 || b2;
      return { question: `Evaluate: ${b1} ${op1} ${b2}`, correctAnswer: ans ? 'true' : 'false', explanation: `Boolean evaluation.` };
    }
  }
];
