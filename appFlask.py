from flask import Flask, request, jsonify
from flask_cors import CORS

from huggingface_hub import login
login(token = "")

from smolagents import CodeAgent, InferenceClientModel

agent = CodeAgent(tools=[], model=InferenceClientModel())

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyzeText():
    data = request.json
    prompt = "Focus on bodies of text. Summarize the following text: " + data['content'] + " --END OF TEXT--. Once you have summarized the text create a question and answer pair based on the text. The question should be insightful and avoid surface level content. The answer should be concise and accurate to the text. Return the question and answer pair in a key-value array with keys 'question' and 'answer'."
    result = agent.run(prompt)
    #result = {'question': "Placeholder Question", 'answer': "Placeholder Answer"}
    return jsonify({"result": result})

if __name__ == '__main__':
    app.run(debug=True)