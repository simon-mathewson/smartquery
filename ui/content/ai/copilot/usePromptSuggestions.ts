import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import superjson from 'superjson';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { ActiveConnectionContext } from '../../connections/activeConnection/Context';
import { copilotChatSuggestions } from '../../connections/demo/copilotChatSuggestions';
import { useSchemaDefinitions } from '../schemaDefinitions/useSchemaDefinitions';
import type { SchemaDefinitions } from '../schemaDefinitions/types';

// Simple hash function for browser compatibility
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

const createSchemaKey = (schemaDefinitions: SchemaDefinitions | null): string | null => {
  if (!schemaDefinitions) return null;
  // Create a key based on the schema definitions structure
  // We use the definitions object (without createdAt) to ensure we detect schema changes
  const schemaString = superjson.stringify(schemaDefinitions.definitions);
  return simpleHash(schemaString);
};

const getStorageKey = (
  activeConnection: { id: string; engine: string; database: string; schema?: string } | undefined,
) => {
  if (!activeConnection) return null;

  const { id, engine, database, schema } = activeConnection;
  return `usePromptSuggestions.suggestions.${id}.${database}${
    engine === 'postgres' ? `.${schema}` : ''
  }`;
};

export const usePromptSuggestions = () => {
  const { cloudApi } = useDefinedContext(CloudApiContext);
  const { activeConnection } = useContext(ActiveConnectionContext) ?? {};
  const { getAndRefreshSchemaDefinitions, hasSchemaDefinitions } = useSchemaDefinitions();

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schemaKey, setSchemaKey] = useState<string | null>(null);

  // Store suggestions keyed by schema key, scoped to connection/database/schema
  const storageKey = useMemo(() => getStorageKey(activeConnection), [activeConnection]);

  const [storedSuggestions, setStoredSuggestions] = useStoredState<Record<string, string[]>>(
    storageKey,
    {},
  );

  const fetchSuggestions = useCallback(
    async (currentSchemaDefinitions: SchemaDefinitions | null, currentKey: string | null) => {
      if (!activeConnection || !currentSchemaDefinitions || !currentKey) {
        setSuggestions([]);
        return;
      }

      // Check if we have cached suggestions for this schema key
      const cached = storedSuggestions[currentKey];
      if (cached) {
        setSuggestions(cached);
        return;
      }

      setIsLoading(true);

      try {
        const schemaDefinitionsText = superjson.stringify(currentSchemaDefinitions.definitions);

        const response = await cloudApi.ai.generatePromptSuggestions.mutate({
          engine: activeConnection.engine,
          schemaDefinitions: schemaDefinitionsText,
        });

        setSuggestions(response);
        setStoredSuggestions((prev) => ({
          ...prev,
          [currentKey]: response,
        }));
      } catch (error) {
        console.error('Failed to fetch prompt suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeConnection, cloudApi, storedSuggestions, setStoredSuggestions],
  );

  useEffect(() => {
    if (!activeConnection) {
      setSuggestions([]);
      setSchemaKey(null);
      return;
    }

    // Return demo suggestions for demo database
    if (activeConnection.id === 'demo') {
      setSuggestions(copilotChatSuggestions);
      setIsLoading(false);
      return;
    }

    if (!hasSchemaDefinitions) {
      setSuggestions([]);
      setSchemaKey(null);
      return;
    }

    const updateSuggestions = async () => {
      const schemaDefinitions = getAndRefreshSchemaDefinitions
        ? await getAndRefreshSchemaDefinitions()
        : null;

      const newKey = createSchemaKey(schemaDefinitions);

      // Only fetch if schema key changed
      if (newKey !== schemaKey && newKey !== null) {
        setSchemaKey(newKey);
        await fetchSuggestions(schemaDefinitions, newKey);
      }
    };

    void updateSuggestions();
  }, [
    activeConnection,
    hasSchemaDefinitions,
    getAndRefreshSchemaDefinitions,
    schemaKey,
    fetchSuggestions,
  ]);

  return useMemo(
    () => ({
      suggestions,
      isLoading,
    }),
    [suggestions, isLoading],
  );
};
