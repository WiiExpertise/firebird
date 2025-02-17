if [[ "$VERCEL_GIT_BRANCH" != "main" ]]; then
    echo "Skipping build for branch: $VERCEL_GIT_BRANCH"
    exit 0
fi

