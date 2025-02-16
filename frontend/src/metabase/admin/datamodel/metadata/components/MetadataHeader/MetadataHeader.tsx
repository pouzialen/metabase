import { useLayoutEffect } from "react";
import { connect } from "react-redux";
import { push, replace } from "react-router-redux";
import { t } from "ttag";
import _ from "underscore";

import Databases from "metabase/entities/databases";
import * as Urls from "metabase/lib/urls";
import { PLUGIN_FEATURE_LEVEL_PERMISSIONS } from "metabase/plugins";
import { DatabaseDataSelector } from "metabase/query_builder/components/DataSelector";
import { Icon } from "metabase/ui";
import type Database from "metabase-lib/v1/metadata/Database";
import type { DatabaseId, SchemaId, TableId } from "metabase-types/api";
import type { Dispatch } from "metabase-types/store";

import { TableSettingsLink } from "./MetadataHeader.styled";

interface OwnProps {
  selectedDatabaseId?: DatabaseId;
  selectedSchemaId?: SchemaId;
  selectedTableId?: TableId;
}

interface DatabaseLoaderProps {
  databases: Database[];
}

interface DispatchProps {
  onSelectDatabase: (
    databaseId: DatabaseId,
    options: { useReplace?: boolean },
  ) => void;
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  // When navigating programatically, use replace so that the browser back button works
  onSelectDatabase: (databaseId, { useReplace = false } = {}) =>
    dispatch(
      useReplace
        ? replace(Urls.dataModelDatabase(databaseId))
        : push(Urls.dataModelDatabase(databaseId)),
    ),
});

type MetadataHeaderProps = OwnProps & DatabaseLoaderProps & DispatchProps;

const MetadataHeader = ({
  databases,
  selectedDatabaseId,
  selectedSchemaId,
  selectedTableId,
  onSelectDatabase,
}: MetadataHeaderProps) => {
  useLayoutEffect(() => {
    if (databases.length > 0 && selectedDatabaseId == null) {
      onSelectDatabase(databases[0].id, { useReplace: true });
    }
  }, [databases, selectedDatabaseId, onSelectDatabase]);

  return (
    <div className="MetadataEditor-header flex align-center flex-no-shrink py4">
      <Icon
        className="flex align-center flex-no-shrink text-medium"
        name="database"
      />
      <div className="MetadataEditor-headerSection h2">
        <DatabaseDataSelector
          databases={databases}
          selectedDatabaseId={selectedDatabaseId}
          setDatabaseFn={onSelectDatabase}
          style={{ padding: 0, paddingLeft: 8 }}
        />
      </div>
      {selectedDatabaseId && selectedSchemaId && selectedTableId && (
        <div className="MetadataEditor-headerSection flex flex-align-right align-center flex-no-shrink">
          <span className="ml4 mr3">
            <TableSettingsLink
              aria-label={t`Settings`}
              to={Urls.dataModelTableSettings(
                selectedDatabaseId,
                selectedSchemaId,
                selectedTableId,
              )}
            >
              <Icon name="gear" />
            </TableSettingsLink>
          </span>
        </div>
      )}
    </div>
  );
};

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default _.compose(
  Databases.loadList({
    query: PLUGIN_FEATURE_LEVEL_PERMISSIONS.dataModelQueryProps,
  }),
  connect(null, mapDispatchToProps),
)(MetadataHeader);
