#!/usr/bin/env python3
"""
Training script for RTO risk scoring model
"""
import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.training.pipeline import TrainingPipeline
import argparse

def main():
    parser = argparse.ArgumentParser(description='Train RTO risk scoring model')
    parser.add_argument(
        '--model',
        type=str,
        default='xgboost',
        choices=['xgboost', 'lightgbm'],
        help='Model type to train'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Output path for model'
    )
    
    args = parser.parse_args()
    
    pipeline = TrainingPipeline()
    if args.output:
        pipeline.config.MODEL_PATH = args.output
    
    model = pipeline.run(model_type=args.model)
    
    if model is None:
        sys.exit(1)
    
    print("Training completed successfully!")

if __name__ == "__main__":
    main()

