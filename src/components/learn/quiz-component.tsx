'use client'

import { useState } from 'react'
import { Check, X, ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  explanation?: string
}

interface QuizComponentProps {
  questions: QuizQuestion[]
  onComplete: (score: number, totalQuestions: number) => void
  onNext?: () => void
}

export function QuizComponent({ questions, onComplete, onNext }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswerSelect = (optionId: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = optionId
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowResults(false)
    } else {
      completeQuiz()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setShowResults(false)
    }
  }

  const handleSubmitAnswer = () => {
    setShowResults(true)
  }

  const completeQuiz = () => {
    const finalScore = calculateScore()
    setScore(finalScore)
    setQuizCompleted(true)
    onComplete(finalScore, questions.length)
  }

  const calculateScore = () => {
    let correctAnswers = 0
    selectedAnswers.forEach((answerId, index) => {
      const question = questions[index]
      const selectedOption = question.options.find(opt => opt.id === answerId)
      if (selectedOption?.isCorrect) {
        correctAnswers++
      }
    })
    return correctAnswers
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setShowResults(false)
    setQuizCompleted(false)
    setScore(0)
  }

  const currentQ = questions[currentQuestion]
  const selectedAnswer = selectedAnswers[currentQuestion]
  const isAnswered = selectedAnswer !== undefined

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 70

    return (
      <Card className="p-6 text-center">
        <div className="mb-6">
          {passed ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2">
            Quiz {passed ? 'Completed!' : 'Incomplete'}
          </h2>
          <p className="text-gray-600">
            You scored {score} out of {questions.length} ({percentage}%)
          </p>
        </div>

        <div className="space-y-4">
          <Badge
            variant={passed ? 'default' : 'secondary'}
            className={passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          >
            {passed ? 'Passed' : 'Failed - 70% required to pass'}
          </Badge>

          <div className="flex justify-center space-x-4">
            <Button onClick={restartQuiz} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            {passed && onNext && (
              <Button onClick={onNext}>
                Continue Learning
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Badge variant="secondary">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          <div className="text-sm text-gray-500">
            Progress: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
        
        <h2 className="text-xl font-semibold mb-6">{currentQ.question}</h2>
      </div>

      <div className="space-y-3 mb-6">
        {currentQ.options.map((option) => {
          const isSelected = selectedAnswer === option.id
          const showCorrect = showResults && option.isCorrect
          const showIncorrect = showResults && isSelected && !option.isCorrect

          return (
            <button
              key={option.id}
              onClick={() => !showResults && handleAnswerSelect(option.id)}
              disabled={showResults}
              className={`w-full p-4 text-left border rounded-lg transition-all ${
                showCorrect
                  ? 'border-green-500 bg-green-50'
                  : showIncorrect
                  ? 'border-red-500 bg-red-50'
                  : isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option.text}</span>
                {showResults && (
                  <div className="ml-2">
                    {option.isCorrect ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : isSelected ? (
                      <X className="h-5 w-5 text-red-600" />
                    ) : null}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {showResults && currentQ.explanation && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Explanation:</h4>
          <p className="text-sm text-gray-700">{currentQ.explanation}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="space-x-2">
          {!showResults ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!isAnswered}
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}