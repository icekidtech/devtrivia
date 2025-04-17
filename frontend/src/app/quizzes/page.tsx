import { getQuizzes } from '@/lib/api';

export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div>
      <h1>Quizzes</h1>
      <ul>
        {quizzes.map((quiz: any) => (
          <li key={quiz.id}>
            <h2>{quiz.title}</h2>
            <p>{quiz.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}