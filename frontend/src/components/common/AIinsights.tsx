'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@component/components/ui/card';
import { Badge } from '@component/components/ui/badge';
import { Sparkles, AlertCircle } from 'lucide-react';
import { AutoTranslate } from './AutoTranslate';

interface AIInsightsProps {
    insights: string;
    aiStatus: {
        service: string;
        model: string;
        available: boolean;
    };
}

export function AIInsights({ insights, aiStatus }: AIInsightsProps) {
    return (
        <AutoTranslate>
        <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-600 rounded-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={aiStatus.available ? "default" : "destructive"}>
                            {aiStatus.available ? '🟢 Active' : '🔴 Offline'}
                        </Badge>
                        <Badge variant="outline">{aiStatus.model}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {aiStatus.available ? (
                    <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {insights}
                        </div>
                    </div>
                ) : (
                    <span>
                        AI service is currently unavailable. Please check your Ollama installation.
                    </span>
                )}
            </CardContent>
        </Card>
        </AutoTranslate>
    );
}