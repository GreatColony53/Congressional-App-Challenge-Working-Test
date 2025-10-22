from flask import Flask, request, jsonify
from flask_cors import CORS

from huggingface_hub import login
login(token = "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")

from smolagents import CodeAgent, InferenceClientModel

agent = CodeAgent(tools=[], model=InferenceClientModel())

app = Flask(__name__)
CORS(app)

@app.route('/api/sum', methods=['POST'])
def calculate_sum():
    data = request.json
    result = agent.run("Summarize the following text:" + data['n'])
    return jsonify({"result": result})

if __name__ == '__main__':
    app.run(debug=True)