**What is expected for a Reinforcement Learning (RL) and Agent-Based Models (ABM) report?** 

- Problem Setup
    - What is the environment or simulation setting?
    - What is the state representation?
    - What actions are available to the agent?
    - What is the reward structure, and why was it chosen?
    - Is the task episodic or continuous?

- Model & Algorithm
    - Which RL algorithm are you using (Q-learning, DQN, PPO, A3C, etc.) and why was it selected?
    - Have you implemented the algorithm from scratch or used an existing framework (e.g., OpenAI Gym, Stable Baselines3, RLlib)?
    - What libraries or frameworks are used?
    - If using agent-based models: how are agents defined, what rules govern their behaviour, what are their observations, and how do agents interact?
    - If using genetic programming methods: what is your population size?

- Training Procedure
    - How are episodes generated? How many episodes were used?
    - What exploration strategy is used?
    - How are hyperparameters tuned?
    - How was the model trained (your personal computer, Google Colab, Compute Canada, etc.)?

- Environment & Simulation Details
    - What environment is used (OpenAI Gym, custom environment, Unity ML-Agents, NetLogo, etc.)?
    - If the environment is custom: how is it implemented and validated?
    - How are randomness and reproducibility handled (random seeds, deterministic settings)?

- Evaluation & Verification
    - What metrics are used (reward curves, success rate, episode lengths, stability over time)?
    - How is performance verified (evaluation episodes, testing with exploration disabled, ablation experiments)?
    - If using ABM: how are emergent behaviours analyzed or validated?
    - Comparison with a baseline policy (random policy, heuristic, or previously existing approach)

- Analysis
    - Critical analysis of learning curves and stability
    - Discussion of convergence, failure modes, or instability
    - Limitations of the environment or reward design
    - What improvements could be made with more time or computational resources?


**Note:** Not all of these factors may apply to your specific project, but you are expected to thoroughly address all elements that are relevant to your approach. You must discuss anything that has relevance, even in a minor way. If you intentionally excluded a component, you must clearly explain why it was excluded.
