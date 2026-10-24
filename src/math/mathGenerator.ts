import { MathCategory, MathQuestion, LevelInfo, EnvironmentTheme } from '../types/game';

let questionCounter = 0;

export function generateMathQuestion(
  category: MathCategory = 'addition',
  difficulty: number = 1 // 1 to 10
): MathQuestion {
  questionCounter++;
  const id = `q_${Date.now()}_${questionCounter}`;
  
  let questionText = '';
  let questionArabic = '';
  let equation = '';
  let correctAnswer = 0;
  let explanation = '';

  // Scale bounds by difficulty (1 to 10)
  const d = Math.max(1, Math.min(10, Math.floor(difficulty)));

  // If category is 'mixed', pick one of the active categories based on difficulty
  let activeCat = category;
  if (category === 'mixed') {
    const cats: MathCategory[] = ['addition', 'subtraction', 'multiplication'];
    if (d >= 3) cats.push('division');
    if (d >= 5) cats.push('order_of_ops');
    if (d >= 7) cats.push('fractions', 'algebra');
    activeCat = cats[Math.floor(Math.random() * cats.length)];
  }

  switch (activeCat) {
    case 'addition': {
      let a = 0;
      let b = 0;
      if (d <= 2) {
        a = Math.floor(Math.random() * 9) + 2;
        b = Math.floor(Math.random() * 9) + 2;
      } else if (d <= 5) {
        a = Math.floor(Math.random() * 40) + 10;
        b = Math.floor(Math.random() * 30) + 10;
      } else {
        a = Math.floor(Math.random() * 80) + 20;
        b = Math.floor(Math.random() * 90) + 25;
      }
      correctAnswer = a + b;
      equation = `${a} + ${b}`;
      questionText = `What is ${a} + ${b}?`;
      questionArabic = `ما ناتج ${a} + ${b} ؟`;
      explanation = `${a} + ${b} = ${correctAnswer}`;
      break;
    }

    case 'subtraction': {
      let a = 0;
      let b = 0;
      if (d <= 2) {
        b = Math.floor(Math.random() * 8) + 2;
        a = b + Math.floor(Math.random() * 9) + 2;
      } else if (d <= 5) {
        b = Math.floor(Math.random() * 30) + 10;
        a = b + Math.floor(Math.random() * 35) + 10;
      } else {
        b = Math.floor(Math.random() * 70) + 20;
        a = b + Math.floor(Math.random() * 80) + 25;
      }
      correctAnswer = a - b;
      equation = `${a} - ${b}`;
      questionText = `What is ${a} - ${b}?`;
      questionArabic = `ما ناتج ${a} - ${b} ؟`;
      explanation = `${a} - ${b} = ${correctAnswer}`;
      break;
    }

    case 'multiplication': {
      let a = 0;
      let b = 0;
      if (d <= 2) {
        a = Math.floor(Math.random() * 5) + 2;
        b = Math.floor(Math.random() * 5) + 2;
      } else if (d <= 5) {
        a = Math.floor(Math.random() * 8) + 3;
        b = Math.floor(Math.random() * 9) + 2;
      } else if (d <= 8) {
        a = Math.floor(Math.random() * 10) + 3;
        b = Math.floor(Math.random() * 11) + 2;
      } else {
        a = Math.floor(Math.random() * 12) + 6;
        b = Math.floor(Math.random() * 12) + 4;
      }
      correctAnswer = a * b;
      equation = `${a} × ${b}`;
      questionText = `What is ${a} × ${b}?`;
      questionArabic = `ما ناتج ${a} × ${b} ؟`;
      explanation = `${a} × ${b} = ${correctAnswer}`;
      break;
    }

    case 'division': {
      const divisor = Math.floor(Math.random() * (d <= 4 ? 6 : 9)) + 2;
      const quotient = Math.floor(Math.random() * (d <= 4 ? 8 : 12)) + 2;
      const dividend = divisor * quotient;
      correctAnswer = quotient;
      equation = `${dividend} ÷ ${divisor}`;
      questionText = `What is ${dividend} ÷ ${divisor}?`;
      questionArabic = `ما ناتج ${dividend} ÷ ${divisor} ؟`;
      explanation = `${dividend} ÷ ${divisor} = ${correctAnswer}`;
      break;
    }

    case 'order_of_ops': {
      // e.g., a + b * c or (a + b) * c
      const a = Math.floor(Math.random() * 6) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      const c = Math.floor(Math.random() * 4) + 2;
      if (Math.random() > 0.5) {
        correctAnswer = a + (b * c);
        equation = `${a} + ${b} × ${c}`;
        questionArabic = `احسب ناتج: ${a} + ${b} × ${c}`;
        explanation = `الضرب أولاً: ${b} × ${c} = ${b * c}، ثم الجمع: ${a} + ${b * c} = ${correctAnswer}`;
      } else {
        correctAnswer = (a + b) * c;
        equation = `(${a} + ${b}) × ${c}`;
        questionArabic = `احسب ناتج: (${a} + ${b}) × ${c}`;
        explanation = `الأقواس أولاً: ${a} + ${b} = ${a + b}، ثم الضرب: ${a + b} × ${c} = ${correctAnswer}`;
      }
      questionText = `Calculate: ${equation}`;
      break;
    }

    case 'fractions': {
      // Simple mental percentage or fraction multiplication
      const percentChoice = [10, 20, 25, 50, 75];
      const p = percentChoice[Math.min(percentChoice.length - 1, Math.floor(Math.random() * percentChoice.length))];
      const baseNumbers = [20, 40, 50, 60, 80, 100, 120, 200];
      const base = baseNumbers[Math.floor(Math.random() * baseNumbers.length)];
      correctAnswer = Math.round((p / 100) * base);
      equation = `${p}% من ${base}`;
      questionArabic = `ما هي قيمة ${p}٪ من ${base} ؟`;
      questionText = `What is ${p}% of ${base}?`;
      explanation = `${p}٪ تعني (${p}/100) × ${base} = ${correctAnswer}`;
      break;
    }

    case 'algebra': {
      // Find x: a*x + b = c
      const x = Math.floor(Math.random() * 8) + 2;
      const a = Math.floor(Math.random() * 4) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      const c = a * x + b;
      correctAnswer = x;
      if (a === 1) {
        equation = `x + ${b} = ${c}`;
        questionArabic = `أوجد قيمة x: [ x + ${b} = ${c} ]`;
        explanation = `x = ${c} - ${b} = ${correctAnswer}`;
      } else {
        equation = `${a}x + ${b} = ${c}`;
        questionArabic = `أوجد قيمة x: [ ${a}x + ${b} = ${c} ]`;
        explanation = `${a}x = ${c} - ${b} = ${c - b} إذن x = ${correctAnswer}`;
      }
      questionText = `Find x in: ${equation}`;
      break;
    }
  }

  // Generate 2 clever distractors
  const distractors = new Set<number>();
  const deltaPool = [-2, -1, 1, 2, -3, 3, 5, -5, 10, -10];
  
  // Shuffle deltas
  const shuffledDeltas = deltaPool.sort(() => Math.random() - 0.5);

  for (const delta of shuffledDeltas) {
    const candidate = correctAnswer + delta;
    if (candidate !== correctAnswer && candidate >= 0 && !distractors.has(candidate)) {
      distractors.add(candidate);
      if (distractors.size === 2) break;
    }
  }

  // Guarantee we have 2 distinct distractors
  let fallbackDelta = 1;
  while (distractors.size < 2) {
    const candidate = Math.max(0, correctAnswer + (distractors.size === 0 ? fallbackDelta : -fallbackDelta));
    if (candidate !== correctAnswer) {
      distractors.add(candidate);
    }
    fallbackDelta++;
  }

  const distArray = Array.from(distractors);

  // Place correct answer randomly into one of the 3 lanes (0: Left, 1: Middle, 2: Right)
  const correctIndex = Math.floor(Math.random() * 3);
  const options: number[] = [];

  let distIdx = 0;
  for (let i = 0; i < 3; i++) {
    if (i === correctIndex) {
      options.push(correctAnswer);
    } else {
      options.push(distArray[distIdx++]);
    }
  }

  return {
    id,
    category: activeCat,
    questionText,
    questionArabic,
    equation,
    options,
    correctIndex,
    correctAnswer,
    explanation,
    difficulty: d
  };
}

/**
 * 100 Levels Generator across 6 beautiful environments
 */
export function generateLevels(): LevelInfo[] {
  const levels: LevelInfo[] = [];

  const worlds: { theme: EnvironmentTheme; titleAr: string; titleEn: string }[] = [
    { theme: 'cosmic_math_dimension', titleAr: 'البُعد الحسابي الكوني', titleEn: 'Cosmic Math Dimension' },
    { theme: 'futuristic_city', titleAr: 'مدينة الركض المستقبلية', titleEn: 'Neo Runner City' },
    { theme: 'magic_forest', titleAr: 'الغابة السحرية المتوهجة', titleEn: 'Enchanted Forest' },
    { theme: 'desert_temple', titleAr: 'معابد الصحراء القديمة', titleEn: 'Ancient Desert Temple' },
    { theme: 'ice_kingdom', titleAr: 'مملكة الجليد الكريستالية', titleEn: 'Crystal Ice Kingdom' },
    { theme: 'volcano_world', titleAr: 'عالم الحمم البركانية', titleEn: 'Molten Volcano Realm' },
    { theme: 'math_sanctuary', titleAr: 'معبد أساطير الرياضيات', titleEn: 'Math Sanctuary of Legends' }
  ];

  for (let i = 1; i <= 100; i++) {
    const worldIndex = Math.min(worlds.length - 1, Math.floor((i - 1) / 15));
    const world = worlds[worldIndex];

    let category: MathCategory = 'addition';
    if (i <= 15) {
      category = 'addition';
    } else if (i <= 30) {
      category = i % 2 === 0 ? 'subtraction' : 'addition';
    } else if (i <= 50) {
      category = 'multiplication';
    } else if (i <= 65) {
      category = i % 2 === 0 ? 'division' : 'multiplication';
    } else if (i <= 80) {
      category = 'order_of_ops';
    } else if (i <= 90) {
      category = i % 2 === 0 ? 'fractions' : 'algebra';
    } else {
      category = 'mixed';
    }

    const difficulty = Math.min(10, Math.ceil((i / 100) * 10));
    const questionsCount = Math.min(12, 4 + Math.floor(i / 14));
    // Normal, comfortable speed pace: starts at 12 and gently reaches 15
    const baseSpeed = 12 + Math.min(3, (i / 100) * 3);
    const targetScore = questionsCount * 300 + i * 50;

    levels.push({
      levelNumber: i,
      world: world.theme,
      title: `${world.titleEn} - Stage ${i}`,
      titleAr: `${world.titleAr} — المرحلة ${i}`,
      targetScore,
      questionsCount,
      category,
      difficulty,
      baseSpeed,
      starsEarned: 0,
      unlocked: true,
      highScore: 0
    });
  }

  return levels;
}
